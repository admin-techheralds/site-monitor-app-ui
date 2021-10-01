
// Handler for Organization
class Organization {

    static CREATE_URL = "/v1/orgs/"
    static LIST_URL = "/v1/orgs/"

    static create(data, cb) {
        console.log("Creating the org with given data:", data)
        sendPostRequest(this.CREATE_URL, data, cb);
    }

    static update(id, data, cb) {
    }

    static delete(id, cb) {

    }

    static list(cb) {
        console.log("Listing the organizations")
        sendGetRequest(this.LIST_URL, cb);
    }
}