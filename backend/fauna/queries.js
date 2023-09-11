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

    return 500;
  }
}

async function logout(_client) {
  // delete the session token on Fauna DB
  const logout_query = fql`Query.token()!.delete()`;

  const logout_result = await _client.query(logout_query);

  return logout_result;
}

async function getUserId(_client) {
  const user_id_query = fql`Administrators.all().first()`;

  const user_document = (await _client.query(user_id_query)).data;

  return user_document;
}

async function createLocationDocument(data) {
  const create_location_query = fql`Locations.create(${data})`;

  const create_location_result = await client.query(create_location_query);

  return create_location_result;
}

module.exports = {
  registerAdmin,
  loginAdmin,
  logout,
  getUserId,
  createLocationDocument,
};
