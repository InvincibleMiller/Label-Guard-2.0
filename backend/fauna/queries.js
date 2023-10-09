// const { Client, fql } = require("fauna");
const fauna = require("fauna");
const { Client, fql } = fauna;
const { decrypt } = require("../../util/crypto");

// configure your client
const client = new Client({
  endpoint: new URL("https://db.fauna.com"),
  secret: process.env.FAUNA_SECRET,
});

async function registerAdmin(email, password, firstName, lastName) {
  const uniqueness_query = fql`Administrators.byEmail(${email}).toArray().length`;

  const uniqueness_result = await client.query(uniqueness_query);

  // for any value other than 0,
  // someone has already registered with that email
  if (uniqueness_result.data !== 0) {
    // do something ...
    return 403;
  } else {
    // Create a new administrator document with
    // a Credential document

    const create_admin_query = fql`
        let admin = Administrators.create({
            email: ${email}, 
            first_name: ${firstName}, 
            last_name: ${lastName},
        })
        Credentials.create({document: admin, password: ${password}})
    `;

    console.log("creating admin: " + email);
    return await client.query(create_admin_query);
  }
}

async function loginAdmin(email, password) {
  try {
    // Fetch the Credential Document from Fauna DB so that we can login
    const credential_doc_query = fql`Credentials.byDocument(Administrators.where(.email == ${email}).first())`;

    const { data: credential_data } = await client.query(credential_doc_query);

    // if no Credential Document exists
    // the user has not been registered
    if (!credential_data) {
      throw new Error("Email not Registered");
    }

    // Because were sure that the user had been registered
    // try to log them in
    const login_query = fql`Credentials.byId(${credential_data.id})!.login(${password})`;

    const login_result = await client.query(login_query);

    return login_result;
  } catch (error) {
    console.error(error);
    if (error.httpStatus) {
      return error.httpStatus;
    }

    return 400;
  }
}

async function logout(_client) {
  // delete the session token on Fauna DB
  const logout_query = fql`Query.token()!.delete()`;

  const logout_result = await _client.query(logout_query);

  return logout_result;
}

async function getUserDoc(_client) {
  const user_id_query = fql`Administrators.all().first()`;

  const { data: user_document } = await _client.query(user_id_query);

  return user_document;
}

async function createLocationDocument(data) {
  const create_location_query = fql`Locations.create(${data})`;

  const create_location_result = await client.query(create_location_query);

  return create_location_result;
}

async function getLocationDocumentById(id) {
  const query = fql`Locations.byId(${id})`;

  const result = await client.query(query);

  return result;
}

async function userHasNoLocations(user_id) {
  const query = fql`Locations.where(.admin_id == ${user_id}).isEmpty()`;

  const result = await client.query(query);

  return result;
}

async function getDefaultLocation(user_id) {
  try {
    const query = fql`Locations.firstWhere(.admin_id == ${user_id})`;

    const result = await client.query(query);

    return result;
  } catch (error) {
    console.error(error);
    return 500;
  }
}

async function locationBelongsToUser(user_id, location_id) {
  if (user_id == undefined || location_id == undefined) {
    return { data: false };
  }

  try {
    const check_query = fql`!Locations.where(.id == ${location_id} && .admin_id == ${user_id}).isEmpty()`;

    const result = await client.query(check_query);

    return result;
  } catch (error) {
    console.error(error);

    return { data: false };
  }
}

async function getAllFormsForLocation(location_id) {
  const form_query = fql`Forms.where(.location_id == ${location_id}) {id, name, description}`;

  const form_results = await client.query(form_query);

  return form_results;
}

async function getAllShiftsForLocation(location_id) {
  const form_query = fql`Shifts.where(.location_id == ${location_id}) {id, name, minimum}`;

  const form_results = await client.query(form_query);

  return form_results;
}

async function getAllProductsForLocation(location_id) {
  const form_query = fql`Products.where(.location_id == ${location_id}) {id, name}`;

  const form_results = await client.query(form_query);

  return form_results;
}

async function getAllViolationsForLocation(location_id) {
  const form_query = fql`Violations.where(.location_id == ${location_id}) {id, name, weight, repeat_weight}`;

  const form_results = await client.query(form_query);

  return form_results;
}

async function createFormDoc(data) {
  const create_doc_query = fql`Forms.create(${data})`;

  const create_doc_result = await client.query(create_doc_query);

  return create_doc_result;
}

async function createShiftDoc(data) {
  const create_doc_query = fql`Shifts.create(${data})`;

  const create_doc_result = await client.query(create_doc_query);

  return create_doc_result;
}

async function createProductDoc(data) {
  const create_product_query = fql`Products.create(${data})`;

  const create_product_results = await client.query(create_product_query);

  return create_product_results;
}

async function createViolationDoc(data) {
  const create_violation_query = fql`Violations.create(${data})`;

  const create_violation_results = await client.query(create_violation_query);

  return create_violation_results;
}

const _getFQLCollection = (documentType) => {
  switch (documentType.toUpperCase()) {
    case "FORMS":
      return fql`Forms`;

    case "SHIFTS":
      return fql`Shifts`;

    case "PRODUCTS":
      return fql`Products`;

    case "VIOLATIONS":
      return fql`Violations`;

    default:
      return null;
  }
};

async function getDocument(document_id, documentType) {
  let root = _getFQLCollection(documentType);

  if (!root) {
    return { data: root };
  }

  const document_query = fql`${root}.byId(${document_id})`;

  const { data: document } = await client.query(document_query);

  return document;
}

async function updateDocument(location_id, document_id, documentType, data) {
  let root = _getFQLCollection(documentType);

  if (!root) {
    return { data: root };
  }

  const update_query = fql`
                          let doc = ${root}.byId(${document_id})
                          if (doc!.location_id == ${location_id}) {
                            doc!.update(${data})
                          } else {
                            null
                          }
                        `;

  const update_result = await client.query(update_query);

  return update_result;
}

async function deleteDocument(location_id, document_id, documentType) {
  let root = _getFQLCollection(documentType);

  if (!root) {
    return { data: root };
  }

  const delete_query = fql`
                          let doc = ${root}.byId(${document_id})
                          if (doc!.location_id == ${location_id}) {
                            doc!.delete()
                          } else {
                            null
                          }
                        `;

  const delete_results = await client.query(delete_query);

  return delete_results;
}

async function loginToForm(form_id, password) {
  const query_form = fql`Forms.byId(${form_id})`;

  const { data: form } = await client.query(query_form);

  // extract the hashed password and location id from the form
  const { password: hashed_form_password, location_id } = form;

  // removed the hashed password from the form object to prevent it
  // from being sent to the client.
  delete form.password;

  // check if the decrypted password matches the user input
  if (decrypt(hashed_form_password) != password) {
    return "Couldn't Log In";
  }

  const query_location = fql`Locations.byId(${location_id})`;

  const { data: location_results } = await client.query(query_location);

  if (!location_results) {
    return "Location doesn't exist!";
  }

  return { form, location: location_results };
}

async function getLocationSettings(location_id) {
  const query = fql`LocationSettings.byLocationId(${location_id}).first()`;

  const { data: settings } = await client.query(query);

  return settings;
}

async function getLastViolationPair(
  location_id,
  violation_id,
  product_id,
  timeStamp
) {
  const query = fql`ViolationPairs.byViolationIdAndProductId(${violation_id}, ${product_id}).where(.found_on <= ${timeStamp}).order(desc(.found_on)).first()`;

  const { data: violationPair } = await client.query(query);

  return violationPair;
}

async function createViolationPair(
  location_id,
  violation_id,
  product_id,
  timeStamp
) {
  const query = fql`ViolationPairs.create({
    location_id: ${location_id},
    violation_id: ${violation_id},
    product_id: ${product_id},
    found_on: ${timeStamp},
  })`;

  const { data: violationPair } = await client.query(query);

  return violationPair;
}

async function createFindingReportDocument(finding_report_skeleton) {
  const query = fql`FindingReports.create(${finding_report_skeleton})`;

  const { data: report } = await client.query(query);

  return report;
}

module.exports = {
  // authentication
  registerAdmin,
  loginAdmin,
  logout,
  getUserDoc,
  createLocationDocument,
  getLocationDocumentById,
  userHasNoLocations,
  getDefaultLocation,
  locationBelongsToUser,
  // dashboard CRUD
  getDocument,
  updateDocument,
  deleteDocument,
  createFormDoc,
  createShiftDoc,
  createProductDoc,
  createViolationDoc,
  getAllFormsForLocation,
  getAllShiftsForLocation,
  getAllProductsForLocation,
  getAllViolationsForLocation,
  // forms
  loginToForm,
  getLocationSettings,
  getLastViolationPair,
  createViolationPair,
  createFindingReportDocument,
};
