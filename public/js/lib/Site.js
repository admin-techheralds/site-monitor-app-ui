
// Handler for Site
class Site {

    static CREATE_URL = "/v1/sites/"
    static LIST_URL = "/v1/sites/"

    static create(org_id, data, cb) {
        console.log("Creating the site with given data:", data)
        sendPostRequest(this.CREATE_URL + org_id, data, cb);
    }

    static update(id, data, cb) {
    }

    static delete(id, cb) {

    }

    static list(org_id, cb) {
        console.log("Listing the sites")
        sendGetRequest(this.LIST_URL + org_id, cb);
    }
}