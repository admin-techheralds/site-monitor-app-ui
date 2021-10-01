
// Handler for Device
class Device {

    static LIST_URL = "/v1/devices/"

    static create(org_id, site_id, data, cb) {
        console.log("Creating the device with given data:", data)
        sendPostRequest(this.CREATE_URL + org_id + '/' + site_id, data, cb);
    }

    static update(id, data, cb) {
    }

    static delete(id, cb) {

    }

    static list(org_id, site_id, cb) {
        console.log("Listing the devices")
        sendGetRequest(this.LIST_URL + org_id + '/' + site_id, cb);
    }
}