
// Handler for Device
class Video {

    static CREATE_URL = "/v1/video/"
    static LIST_URL = "/v1/videos/"

    static update(id, data, cb) {
    }

    static delete(id, cb) {

    }

    static list(org_id, site_id, device_id, cb) {
        console.log("Listing the videos")
        sendGetRequest(this.LIST_URL + org_id + '/' + site_id + "/" + device_id, cb);
    }
}