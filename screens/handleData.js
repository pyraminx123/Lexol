import {open} from '@op-engineering/op-sqlite';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid'; // to generate random values

const db = open({name: 'myDb.sqlite'});

const sanitizeName = name => {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
};

const removeWhiteSpace = name => {
  return name.replace(/\W+/g, '_'); // some random regex that replaces ' ' & special characters with _
};

const generateUniqueTableName = name => {
  const nameWithoutSpaces = removeWhiteSpace(name);
  const uniqueID = uuidv4().replace(/-/g, ''); // regex removes -
  return `${nameWithoutSpaces}_${uniqueID}`;
};

const createFoldersTable = async () => {
  try {
    await db.execute(
      `CREATE TABLE IF NOT EXISTS allFolders (
        folderID INTEGER PRIMARY KEY,
        originalFolderName TEXT,
        uniqueFolderName TEXT UNIQUE
      );`,
    );
  } catch (error) {
    console.error('Error creating allFolders table', error);
  }
};

const insertIntoAllFolders = async folderName => {
  try {
    const uniqueFolderName = generateUniqueTableName(folderName);
    await db.execute(
      'INSERT INTO allFolders (originalFolderName, uniqueFolderName) VALUES (?, ?);',
      [folderName, uniqueFolderName],
    );
    return {uniqueFolderName};
  } catch (error) {
    console.error(
      `Some error occurred trying to insert ${folderName} into allFolders`,
      error,
    );
  }
};

const createFolder = async folderName => {
  if (folderName.trim().length === 0) {
    console.log('Input is empty or whitespace, no folder was created');
    return;
  }
  try {
    const {uniqueFolderName} = await insertIntoAllFolders(folderName);
    db.execute(
      `CREATE TABLE ${uniqueFolderName} (
        deckID INTEGER PRIMARY KEY,
        originalDeckName TEXT,
        uniqueDeckName TEXT UNIQUE,
        folderID INTEGER,
        FOREIGN KEY (folderID) REFERENCES allFolders(folderID)
      );`,
    );
    //console.log(`Table ${uniqueFolderName} created successfully`);
  } catch (error) {
    console.error(
      `Some error occurred trying to create a table ${folderName}`,
      error,
    );
  }
};

const deleteFolder = async (folderID, fetchFolders) => {
  try {
    const uniqueFolderName = await db.execute(
      'SELECT uniqueFolderName FROM allFolders WHERE folderID=?',
      [folderID],
    ).rows._array[0].uniqueFolderName;
    // delete row inside allFolders
    db.execute('DELETE FROM allFolders WHERE folderID=?;', [folderID]);
    try {
      // deletes associated decks
      const decks = retrieveDataFromTable(uniqueFolderName);
      console.log('decks inside folder (delete function)', decks);
      for (let index = 0; index < decks.length; index++) {
        const uniqueDeckName = decks[index].uniqueDeckName;
        await db.execute(`DROP TABLE IF EXISTS "${uniqueDeckName}";`);
      }
      try {
        // deletes table
        await db.execute(`DROP TABLE "${uniqueFolderName}";`);
      } catch (error) {
        console.error(
          `An error occurred trying to delete the table ${uniqueFolderName}.`,
          error,
        );
      }
    } catch (error) {
      console.error(`Couldn't delete decks inside ${uniqueFolderName}`, error);
    }
  } catch (error) {
    console.error(
      `An error occurred trying to delete ${folderID} from allFolders.`,
      error,
    );
  }
  // soo that it rerenders
  fetchFolders();
};

const createDeck = (originalDeckName, uniqueFolderName) => {
  if (originalDeckName.trim().length === 0) {
    console.log('Input is empty or whitespace, no deck was created');
    return;
  }
  const uniqueDeckName = generateUniqueTableName(originalDeckName);
  try {
    db.execute(
      `CREATE TABLE IF NOT EXISTS ${uniqueDeckName} (
        id INTEGER PRIMARY KEY,
        term TEXT,
        definition TEXT,
        deckID INTEGER,
        FOREIGN KEY (deckID) REFERENCES ${uniqueFolderName}(deckID)
      );`,
    );
    insertIntoFolder(uniqueFolderName, originalDeckName, uniqueDeckName);
  } catch (error) {
    console.log('deckName:', originalDeckName, 'folderName:', uniqueFolderName);
    console.error(
      `Some error occurred trying to create a table ${uniqueDeckName}`,
      error,
    );
  }
};

const insertIntoFolder = (
  uniqueFolderName,
  originalDeckName,
  uniqueDeckName,
) => {
  try {
    db.execute(
      `INSERT INTO ${uniqueFolderName} (originalDeckName, uniqueDeckName) VALUES (?, ?);`,
      [originalDeckName, uniqueDeckName],
    );
  } catch (error) {
    console.error(
      'Some error occurred trying to get the folderID from allFolders',
      error,
    );
  }
};

const deleteDeck = (uniqueFolderName, uniqueDeckName, fetchDecks) => {
  // deletes row inside folder
  try {
    db.execute(`DELETE FROM ${uniqueFolderName} WHERE uniqueDeckName=?;`, [
      uniqueDeckName,
    ]);
    // deletes deck
    try {
      db.execute(`DROP TABLE IF EXISTS "${uniqueDeckName}";`);
    } catch (error) {
      console.error(`Couldn't delete ${uniqueDeckName}`, error);
    }
  } catch (error) {
    console.log(uniqueDeckName);
    console.error(
      `Some error occurred trying to delete a deck from ${uniqueFolderName}`,
      error,
    );
  }
  // just to check if it works
  console.log(
    db.execute('SELECT name FROM sqlite_master WHERE type="table";').rows,
  );
  // so that it rerenders
  fetchDecks();
};

const insertIntoDeck = async (folderName, deckName, term, definition) => {
  const sanitizedDeckName = sanitizeName(deckName);
  const deckID = await db.execute(
    `SELECT deckID FROM ${folderName} WHERE deckName=?`,
    [deckName],
  ).rows._array[0].deckID;
  console.log(deckID, 'id');

  if (term.trim().length > 0 && definition.trim().length > 0) {
    try {
      db.execute(
        `INSERT INTO ${sanitizedDeckName} (term, definition, deckID)
          VALUES (?, ?, ?);`,
        [term, definition, deckID],
      );
    } catch (error) {
      console.error(
        `Some error occurred trying to insert ${term} into ${deckName}`,
        error,
      );
    }
  }
};

const retrieveDataFromTable = tableName => {
  try {
    const res = db.execute(`SELECT * FROM ${tableName}`).rows._array;
    return res;
  } catch (error) {
    console.error(`No such table ${tableName} exists`, error);
  }
};

export {
  generateUniqueTableName,
  createFoldersTable,
  createFolder,
  createDeck,
  deleteDeck,
  deleteFolder,
  insertIntoDeck,
  retrieveDataFromTable,
};
