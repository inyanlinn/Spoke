import { r } from "src/server/models";
import humps from "humps";
// Knex instance used by the db package, just an alias for thinky's connection
// for now.
// TODO[matteo]: maybe split out the connection and add post processing:
//   http://knexjs.org/#Installation-post-process-response
const knex = r.knex;

async function transaction(fn) {
  return knex.transaction(fn);
}

/**
 * Run a block of code, creating a new transaction if one isn't passed
 *
 * @param existingTransaction nullable knex transaction object
 * @param fn async function that takes a transaction as its only argument
 * @return {Promise<*>}
 */
async function withTransaction(existingTransaction, fn) {
  if (existingTransaction) {
    return await fn(existingTransaction);
  }
  return await transaction(trx => fn(trx));
}

function queryBuilder(tableName, opts) {
  const trx = opts && opts.transaction;
  return trx ? trx(tableName) : r.knex(tableName);
}

function camelize(obj) {
  return humps.camelizeKeys(obj, { separator: "_" });
}

function decamelize(obj) {
  return humps.decamelizeKeys(obj, { separator: "_" });
}

// Generic get function
async function getAny(tableName, fieldName, fieldValue, opts) {
  const result = await queryBuilder(tableName, opts)
    .where(fieldName, fieldValue)
    .first();
  return camelize(result);
}

const Table = {
  ASSIGNMENT: "assignment",
  CAMPAIGN: "campaign",
  CAMPAIGN_CONTACT: "campaign_contact",
  CANNED_RESPONSE: "canned_response",
  INTERACTION_STEP: "interaction_step",
  INVITE: "invite",
  JOB_REQUEST: "job_request",
  MESSAGE: "message",
  OPT_OUT: "opt_out",
  ORGANIZATION: "organization",
  PENDING_MESSAGE_PART: "pending_message_part", // unused
  QUESTION_RESPONSE: "question_response",
  TAG: "tag",
  TWILIO_PHONE_NUMBER: "twilio_phone_number",
  USER: "user",
  USER_CELL: "user_cell", // unused, i think
  USER_ORGANIZATION: "user_organization",
  ZIP_CODE: "zip_code" // unused
};

export {
  queryBuilder,
  Table,
  knex,
  getAny,
  camelize,
  decamelize,
  transaction,
  withTransaction
};