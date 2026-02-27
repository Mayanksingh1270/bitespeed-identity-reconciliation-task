const pool = require("../config/db");

exports.identifyContact = async (req, res) => {
  let { email, phoneNumber } = req.body;

  email = email?.trim().toLowerCase() || null;
  phoneNumber = phoneNumber ? String(phoneNumber).trim() : null;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phoneNumber required" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [matches] = await connection.execute(
      `SELECT * FROM Contact
       WHERE (email = ? OR phoneNumber = ?)
       AND deletedAt IS NULL
       FOR UPDATE`,
      [email, phoneNumber]
    );

    if (matches.length === 0) {
      const [result] = await connection.execute(
        `INSERT INTO Contact (email, phoneNumber, linkPrecedence, rootId)
         VALUES (?, ?, 'primary', 0)`,
        [email, phoneNumber]
      );

      await connection.execute(
        `UPDATE Contact SET rootId = ? WHERE id = ?`,
        [result.insertId, result.insertId]
      );

      await connection.commit();

      return res.status(200).json({
        contact: {
          primaryContactId: result.insertId,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: []
        }
      });
    }


    const rootIds = [...new Set(matches.map(c => c.rootId))];

    const placeholders = rootIds.map(() => "?").join(",");

    const [cluster] = await connection.execute(
      `SELECT * FROM Contact
       WHERE rootId IN (${placeholders})
       AND deletedAt IS NULL
       ORDER BY createdAt ASC`,
      rootIds
    );

    const oldestPrimary = cluster.find(
      c => c.linkPrecedence === "primary"
    );

    const primaryId = oldestPrimary.id;
    const rootId = oldestPrimary.rootId;

    if (rootIds.length > 1) {
      await connection.execute(
        `UPDATE Contact
         SET rootId = ?,
             linkPrecedence = 'secondary',
             linkedId = ?
         WHERE rootId IN (${placeholders})
         AND id != ?`,
        [rootId, primaryId, ...rootIds, primaryId]
      );
    }


    const existingEmails = new Set(
      cluster.map(c => c.email).filter(Boolean)
    );

    const existingPhones = new Set(
      cluster.map(c => c.phoneNumber).filter(Boolean)
    );

    if (
      (email && !existingEmails.has(email)) ||
      (phoneNumber && !existingPhones.has(phoneNumber))
    ) {
      await connection.execute(
        `INSERT INTO Contact
         (email, phoneNumber, linkedId, linkPrecedence, rootId)
         VALUES (?, ?, ?, 'secondary', ?)`,
        [email, phoneNumber, primaryId, rootId]
      );
    }

    await connection.commit();

    const [finalCluster] = await pool.execute(
      `SELECT * FROM Contact
       WHERE rootId = ?
       AND deletedAt IS NULL
       ORDER BY createdAt ASC`,
      [rootId]
    );


    const emails = [
      ...new Set([
        oldestPrimary.email,
        ...finalCluster.map(c => c.email)
      ])
    ].filter(Boolean);

    const phoneNumbers = [
      ...new Set([
        oldestPrimary.phoneNumber,
        ...finalCluster.map(c => c.phoneNumber)
      ])
    ].filter(Boolean);

    const secondaryIds = finalCluster
      .filter(c => c.id !== primaryId)
      .map(c => c.id);

    return res.status(200).json({
      contact: {
        primaryContactId: primaryId,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryIds
      }
    });

  } catch (error) {
    await connection.rollback();

    if (error.code === "ER_LOCK_DEADLOCK") {
      return res.status(409).json({
        error: "Deadlock detected. Retry request."
      });
    }

    console.error("Identity Error:", error);
    return res.status(500).json({
      error: "Internal Server Error"
    });

  } finally {
    connection.release();
  }
};