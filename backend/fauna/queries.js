// const { Client, fql } = require("fauna");
const fauna = require("fauna");
const { Client, fql } = fauna;

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

const _getFQLCollection = (documentType) => {
  switch (documentType.toUpperCase()) {
    case "FORMS":
      return fql`Forms`;
      break;

    case "SHIFTS":
      return fql`Shifts`;
      break;

    case "PRODUCTS":
      return fql`Products`;
      break;

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

module.exports = {
  registerAdmin,
  loginAdmin,
  logout,
  getUserDoc,
  createLocationDocument,
  getLocationDocumentById,
  userHasNoLocations,
  getDefaultLocation,
  locationBelongsToUser,
  getDocument,
  updateDocument,
  deleteDocument,
  createFormDoc,
  createShiftDoc,
  createProductDoc,
  getAllFormsForLocation,
  getAllShiftsForLocation,
  getAllProductsForLocation,
};
