#!/usr/bin/env node

const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined");
}

async function dropIndexIfExists(collection, indexName) {
  const indexes = await collection.indexes();
  if (!indexes.some((index) => index.name === indexName)) return;

  await collection.dropIndex(indexName);
  console.log(`Dropped index: ${indexName}`);
}

async function main() {
  await mongoose.connect(uri);

  const collection = mongoose.connection.collection("categories");
  const beforeIndexes = await collection.indexes();

  console.log("Existing category indexes:");
  console.table(beforeIndexes.map((index) => ({
    name: index.name,
    key: JSON.stringify(index.key),
    unique: Boolean(index.unique),
  })));

  await dropIndexIfExists(collection, "categoryName_1");
  await dropIndexIfExists(collection, "slug_1");
  await dropIndexIfExists(collection, "parentId_1_categoryName_1");
  await dropIndexIfExists(collection, "parentId_1_slug_1");
  await collection.createIndex(
    { parentId: 1, slug: 1 },
    { unique: true, name: "parent_slug_unique" }
  );
  await collection.createIndex(
    { isActive: 1, createdAt: -1 },
    { name: "isActive_1_createdAt_-1" }
  );
  await collection.createIndex(
    { categoryName: 1, isActive: 1 },
    { name: "categoryName_1_isActive_1" }
  );
  await collection.createIndex(
    { slug: 1, isActive: 1 },
    { name: "slug_1_isActive_1" }
  );
  await collection.createIndex(
    { parentId: 1, isActive: 1 },
    { name: "parentId_1_isActive_1" }
  );

  const afterIndexes = await collection.indexes();

  console.log("Updated category indexes:");
  console.table(afterIndexes.map((index) => ({
    name: index.name,
    key: JSON.stringify(index.key),
    unique: Boolean(index.unique),
  })));
  console.log("Category indexes synced.");
  console.log("Manual MongoDB fallback:");
  console.log('  db.categories.getIndexes()');
  console.log('  db.categories.dropIndex("categoryName_1")');
  console.log("If the unique categoryName index has another name, drop that exact index name instead.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
