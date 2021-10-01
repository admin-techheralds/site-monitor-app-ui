
initializeHomePageAfterSuccesfulLogin = function() {

    loadOrganizations(function(err) {
        if(err) {
            console.log("Something went wrong in loading the organizations.");
            return;
        }
        setLoadingIconOnDashboardWidgets();
        loadDashboard(function(err) {
            if(err) {
                console.log("Something went wrong in loading the widgets")
                return;
            }
        });
    })
}

loadOrganizations = function(cb) {

    $('#org_list').html('');
    $('#org_list').selectpicker('refresh')

    Organization.list(function(err, result) {
        if(err) {
            console.log("Error while listing the organizations . Err:" + JSON.stringify(err));
            cb(err);
            return;
        }
        if(result['error'] != undefined) {
            console.log("Custom Error while listing the organizations . Err:" + result['error']);
            cb(result['error']);
            return;
        }
        console.log("Successfully got the response on listing the organizations. Response is:" + JSON.stringify(result));
        org_list.length = 0;
        org_list = result['orgs'];
        var options = [];
        var default_selected_id = -1;
        org_list.forEach(function(org) {
            if(options.length == 0) {
                default_selected_id = org['org_id'];
            }
            options.push("<option value='" + org['org_id'] + "'>" + org['org_name'] + "</option>");
        })
        $('#org_list').html(options.join(''));
        $('#org_list').selectpicker('refresh');
        $('#org_list').selectpicker(default_selected_id);
        cb();
    });
}

loadDashboard = function(cb) {

    showDashboardSection();

    $('.nav-sidebar .nav-link').removeClass('active');
    $('.nav-sidebar #dashboard_link').addClass('active');

    setLoadingIconOnDashboardWidgets();
    loadSitesStatistics(function(siteErr) {

        loadDeviceStatistics(function(devErr) {
            
            if(typeof cb === "function" ) {
                if(siteErr || devErr) {
                    cb( {
                        siteErr: siteErr,
                        deviceErr: devErr
                    })
                    return;
                }
                cb();
            }
        })
    })
}

setLoadingIconOnDashboardWidgets = function() {
    const loadingWidget = "<div class='overlay'><i class='fas fa-3x fa-sync-alt fa-spin'></i></div>";
    $('#site-widget-dashboard .small-box').append(loadingWidget);
    $('#devices-widget-dashboard .small-box').append(loadingWidget);
}

loadSitesStatistics = function(cb) {
    const selected_org_id = parseInt($('#org_list').selectpicker('val'));
    console.log("Listing the sites of the selected org:" + selected_org_id);
    Site.list(selected_org_id, function(err, result) {
        $('#site-widget-dashboard .overlay').remove();
        if(err) {
            console.log("Error while listing the sites . Err:" + JSON.stringify(err));
            $('#site-widget-dashboard .sites_count').text("-1");
            cb(err);
            return;
        }
        if(result['error'] != undefined) {
            console.log("Custom Error while listing the sites . Err:" + result['error']);
            $('#site-widget-dashboard .sites_count').text("-1");
            cb(result['error']);
            return;
        }
        console.log("Successfully got the response on listing the sites. Response is:" + JSON.stringify(result));
        site_list.length = 0;
        site_list = result.sites;
        $('#site-widget-dashboard .sites_count').text(site_list.length);


        // const site_menu_item_left = '<li class="nav-item" id="site_menu_id_<REPLACE_SITE_MENU_ID>"><a href="javascript:loadSiteDetails(<REPLACE_SITE_ID>);" class="nav-link"><i class="far fa-circle nav-icon"></i><p><REPLACE_SITE_NAME></p></a></li>';
        const site_menu_item_left = '<li class="nav-item" id="site_menu_id_<REPLACE_SITE_MENU_ID>"><a href="#" class="nav-link"><i class="fas fa-university nav-icon"></i><p><REPLACE_SITE_NAME></p></a></li>';
        var menu_items = []
        site_list.forEach(function(site) {
            var menu_item = site_menu_item_left.replace("<REPLACE_SITE_ID>", site['site_id']);
            menu_item = menu_item.replace("<REPLACE_SITE_NAME>", site['site_name']);
            menu_item = menu_item.replace("<REPLACE_SITE_MENU_ID>", site['site_id']);

            menu_items.push(menu_item);
        })
        $('#sites_list_in_sidemenu').html(menu_items.join(''));
        if(menu_items.length > 0) {
            $('#sites_list_in_sidemenu').removeAttr('style');
        }
        cb();
    });
}

loadDeviceStatistics = function(cb) {

    const selected_org_id = parseInt($('#org_list').selectpicker('val'));

    var index = 0;
    var deviceListError = []
    device_list.length = 0;
    site_list.forEach(function(site) {
        const site_id = site['site_id'];
        console.log("Getting the devices for the site:" + site_id);
        Device.list(selected_org_id, site_id, function(err, result) {
            index++;
            if(err) {
                deviceListError.push(err);
                console.log("Error occurred while listing the devices from site:" + site_id + ",  org:" + selected_org_id);
            }
            if(result['error'] != undefined) {
                console.log("Custom Error while listing the devices from site:" + site_id + ",  org:" + selected_org_id);
                deviceListError.push(new Error(result['error']));
            } else {
                var devicesList = result.devices;
                devicesList.forEach(function(device) {
                    device_list.push(device)
                });
                loadDeviceMenusOnLeftSite(site_id, devicesList)
            }

            if(site_list.length <= index) {
                console.log("All devices for the list of sites have been received");
                $('#devices-widget-dashboard .overlay').remove();
                $('#devices-widget-dashboard .devices_count').text(device_list.length);

                if(typeof cb === "function") {
                    if(deviceListError.length > 0) {
                        cb(deviceListError);
                    } else {
                        cb();
                    }
                }

            }
        })
    });
}

loadDeviceMenusOnLeftSite = function(site_id, devicelistInSite) {

    const device_menu_item_left = '<li class="nav-item" id="device_menu_id_<REPLACE_DEVICE_MENU_ID>"><a href="javascript:loadVideosFromDevice(<REPLACE_SITE_ID>, <REPLACE_DEVICE_ID>);" class="nav-link"><i class="fas fa-video nav-icon"></i><p><REPLACE_DEVICE_NAME></p></a></li>';
    $('#site_menu_id_' + site_id + ' .nav-treeview').remove();
    var device_menu_items = []
    devicelistInSite.forEach(function(device) {
        var device_menu_item = device_menu_item_left.replace("<REPLACE_DEVICE_MENU_ID>", device['device_id']);
        device_menu_item = device_menu_item.replace("<REPLACE_SITE_ID>", site_id);
        device_menu_item = device_menu_item.replace("<REPLACE_DEVICE_ID>", device['device_id']);
        device_menu_item = device_menu_item.replace("<REPLACE_DEVICE_NAME>", device['device_name']);

        device_menu_items.push(device_menu_item);
    })
    var device_main_menu_list = '<ul class="nav nav-treeview device_side_menu_list">' + device_menu_items.join('') + '</ul>'
    $('#site_menu_id_' + site_id).append(device_main_menu_list);
}

loadUIComponents = function() {
    // const org = {
    //     org_id : 1,
    //     org_name: 'My Test Org',
    //     org_description: 'This is test organisation'
    // }
    // sendPostRequest("/v1/orgs", org, function(err, result) {
    //     if(err) {
    //         console.log("Error while creating the org . Err:" + err);
    //         return;
    //     }
    //     console.log("Successfully got the response on creating the org. Response is:" + JSON.stringify(result));
    // });

    // sendGetRequest("/v1/orgs", function(err, result) {
    //     if(err) {
    //         console.log("Error while listing the org . Err:" + err);
    //         return;
    //     }
    //     console.log("Successfully got the response on listing the org. Response is:" + JSON.stringify(result));
    // });

    // Organization.create(org, function(err, result) {
    //     if(err) {
    //         console.log("Error while creating the org . Err:" + JSON.stringify(err));
    //         return;
    //     }
    //     console.log("Successfully got the response on creating the org. Response is:" + JSON.stringify(result));
    // })

    // Site.list(0, function(err, result) {
    //     if(err) {
    //         console.log("Error while listing the sites . Err:" + JSON.stringify(err));
    //         return;
    //     }
    //     console.log("Successfully got the response on listing the sites. Response is:" + JSON.stringify(result));
    // })
}

loadSiteDetails = function(site_id) {
    $('.nav-sidebar .nav-link').removeClass('active');
    $('.nav-sidebar #site_menu_id_' + site_id + ' .nav-link').addClass('active');
    console.log("Clicked the menu item on:" + '.nav-sidebar #site_menu_id_' + site_id + ' .nav-link')
}

showDashboardSection = function() {
    hideElement('#video-gallery-section');
    showElement('#dashboard-section');
}

showVideoGallerySection = function() {
    hideElement('#dashboard-section');
    showElement('#video-gallery-section');
}


getSiteByID = function(site_id) {
    var site = undefined;
    if(site_list == undefined || site_list.length <= 0) {
        console.log("Site list is found to be empty")
        return site;
    }
    const filtered_sites = site_list.filter(site => site['site_id'] == site_id)
    if(filtered_sites.length > 0) {
        return filtered_sites[0];
    }
    return site;
}

getDeviceByID = function(device_id) {
    var device = undefined;
    if(device_list == undefined || device_list.length <= 0) {
        console.log("Device list is found to be empty")
        return device;
    }
    const filtered_devices = device_list.filter(device => device['device_id'] == device_id)
    if(filtered_devices.length > 0) {
        return filtered_devices[0];
    }
    return device;
}

setLoadingIconVideoGallery = function(msg) {
    msg = msg === undefined ? "" : msg;
    const loadingWidget = "<div class='overlay'><p>" + msg + "</p><i class='fas fa-3x fa-sync-alt fa-spin'></i></div>";
    $('#video_gallery_panel').append(loadingWidget);
}

removeLoadingIconVideoGallery = function() {
    $('#video_gallery_panel .overlay').remove();
}

loadVideosFromDevice = function(site_id, device_id) {

    showVideoGallerySection();
    $('.nav-sidebar .nav-link').removeClass('active');
    $('.nav-sidebar #device_menu_id_' + device_id + ' .nav-link').addClass('active');
    const site = getSiteByID(site_id);
    if(site == undefined) {
        showErrorAlert("Failed to get the site details for the selected site")
        return;
    }
    const device = getDeviceByID(device_id);
    if(device == undefined) {
        showErrorAlert("Failed to get the device details for the selected device")
        return;
    }

    $('#selected_site_name_video_gallery').text(site['site_name'])
    $('#selected_device_name_video_gallery').text(device['device_name'])

    setLoadingIconVideoGallery();
    // setTimeout(function() {
    //     removeLoadingIconVideoGallery();
    // }, 5000)
    const selected_org_id = parseInt($('#org_list').selectpicker('val'));

    video_list.length = 0;
    $('#video_gallery_panel #video_count').text(video_list.length);
    console.log("Getting the videos for the device:" + device_id + " of site:" + site_id + " from org:" + selected_org_id);
    Video.list(selected_org_id, site_id, device_id,  function(err, result) {
        removeLoadingIconVideoGallery();
        if(err) {
            console.log("Error occurred while listing the videos from device:" + device_id + " site:" + site_id + ",  org:" + selected_org_id);
            if(typeof cb === "function") {
                cb(err);
            }
            return;
        }
        
        if(result['error'] != undefined) {
            console.log("Custom Error while listing the videos from device:" + device_id + " site:" + site_id + ",  org:" + selected_org_id);
            if(typeof cb === "function") {
                cb(new Error(result['error']));
            }
            return;
        }
        console.log('Requested videos have been received from the given device/site/org');
        video_list = result['videos'];
        console.log('Video List to be populated is', video_list);
        $('#video_gallery_panel #video_count').text(video_list.length);
        


        // var video_list_display = [];
        // var video_index = 0;
        // video_list.forEach(function(video) {
        //     if(video_index == 0) {

        //         video_list_display.push("<video controls poster='" + video['video_preview_image_url'] + "'>");
        //         video_list_display.push("<source src='" + video['video_url'] + "' type='video/mp4'>");
        //         if(video['video_url_alt1']) {
        //             video_list_display.push("<source src='" + video['video_url_alt1'] + "' type='video/mp4'>");
        //         }
        //         video_list_display.push("</video>");
        //         video_list_display.push("<figcaption>");
        //         video_list_display.push("<a href='" + video['video_url'] + "'><img src='" + video['video_preview_image_url'] + "'  alt=''></a>");
        //     } else {
        //         video_list_display.push("<a href='" + video['video_url'] + "'><img src='" + video['video_preview_image_url'] + "'  alt=''></a>");
        //     }
        //     video_index++;
        // });
        // video_list_display.push("</figcaption>");
        // $('#site_video_player').html(video_list_display.join(''))
        // registerLinkHandlersOnVideoImages();

        //loadVideosUsingVideoJS();
        loadVideosInCarousel();
    });
}

loadVideosInCarousel = function() {

    var indicatorsList = [];
    var carouselVideoList = [];

    var indicatorIndex = 0;
    video_list.forEach(function(v) {
        var indicator = '<li data-target="#site-video-viewer"'
        if(indicatorIndex == 0) {
            indicator += 'data-slide-to="' + indicatorIndex + '" class="active">';
        } else {
            indicator += 'data-slide-to="' + indicatorIndex + '">';
        }
        indicator += '</li>'

        var videoDisplayItem = '<div class="carousel-item ';
        if(indicatorIndex == 0) {
            videoDisplayItem += 'active"'
        } else {
            videoDisplayItem += '"'
        }
        videoDisplayItem += '>'

        // videoDisplayItem += '<img class="d-block w-100" src="' + v['video_preview_image_url'] + '">'
        videoDisplayItem += '<div class="embed-responsive embed-responsive-16by9">'
        videoDisplayItem += '<iframe class="embed-responsive-item" src="' + v['video_url'] + '" allowfullscreen></iframe>'
        videoDisplayItem += '</div>'

        videoDisplayItem += '<div class="carousel-caption d-none d-md-block">'
        videoDisplayItem += '<h5>Kern-Care</h5>'
        videoDisplayItem += '<p>Captured on: <span class="badge badge-secondary">' + v['created_on'] + '</span></p>'
        videoDisplayItem += '</div>'

        videoDisplayItem += '</div>'

        indicatorsList.push(indicator);
        carouselVideoList.push(videoDisplayItem);

        indicatorIndex++;
    });

    $('#site-video-viewer .carousel-indicators').html(indicatorsList.join(''));
    $('#site-video-viewer .carousel-inner').html(carouselVideoList.join(''));
}

loadVideosUsingVideoJS = function() {

    var player = videojs('site-video');

    var videoPlayList = [];
    video_list.forEach(function(v) {
        var currentVideoDetails = {};
        currentVideoDetails['src'] = v['video_url'];
        currentVideoDetails['type'] = 'video/mp4';
        
        var sources = [];
        sources.push(currentVideoDetails);
        var videoDetailsWithImage = {
            sources: sources,
            poster: v['video_preview_image_url']
        }
        videoPlayList.push(videoDetailsWithImage);
    });

    console.log("CUrrent playlist is", videoPlayList);
    player.playlist(videoPlayList)
    player.playlist.autoadvance(0);
}

videoImageClickHandler = function(clickEvent) {
    clickEvent.preventDefault();
	videotarget = this.getAttribute("href");
	filename = videotarget.substr(0, videotarget.lastIndexOf('.')) || videotarget;
	video = document.querySelector("#site_video_player video");
	video.removeAttribute("controls");
	video.removeAttribute("poster");
	source = document.querySelectorAll("#site_video_player video source");
	source[0].src = filename + ".mp4";
	// source[1].src = filename + ".mp4";
	video.load();
	video.play();
}

registerLinkHandlersOnVideoImages = function() {
    var video_player = document.getElementById("site_video_player"),
    links = video_player.getElementsByTagName('a');
    for (var i=0; i<links.length; i++) {
        links[i].onclick = videoImageClickHandler;
    }
}

