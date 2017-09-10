/* Copyright 2015, All Rights Reserved. */
var checkTimeout = 5000,
    checkDelay = 100,
    showIPPort = true,
    showConnection = true,
    clickToRefresh = false,
    fixPing = true,
    selected = "Main",
    subSelection = "",
    processing = 0,
    hash = window.location.hash.split('-'),
    alreadyProcessed = [],
    rendered = 0,
    loadingTimers = [],
    loadingArr = [{
        loading: true,
        unknown: true
    }],
    clockTicking = false;

if (hash.length) {
    switch (hash[0]) {
        case "#EMS":
        case "#GMS":
            //case "#JMS":
        case "#THMS":
        case "#MSEA":
            //case "#MS2":
            selected = hash[0].replace('#', '');
            break;
        default:
            break;
    }
}

if (hash.length > 1) {
    subSelection = hash[1];
} else {
    subSelection = GetDefaultSubSelectionForVersion(selected);
}

function ping(ip, callback) {
    if (!this.inUse) {
        this.status = 'unchecked';
        this.inUse = true;
        this.callback = callback;
        this.ip = ip;
        this.start = 0;
        var _that = this;
        this.img = new Image();
        this.img.onload = function(e) {
            window.clearInterval(_that.timer);
            _that.inUse = false;
            _that.callback('responded', +(new Date()) - _that.start);
            if (--processing == 0)
                if (window.stop) {
                    window.stop();
                } else if (document.execCommand) {
                document.execCommand('Stop');
            };
        };
        this.img.onerror = function(e, error, errorThrown) {
            if (_that.inUse) {
                window.clearInterval(_that.timer);
                _that.inUse = false;
                _that.callback('responded', +(new Date()) - _that.start, e);
                if (--processing == 0)
                    if (window.stop) {
                        window.stop();
                    } else if (document.execCommand) {
                    document.execCommand('Stop');
                };
                return true;
            }
        };
        this.start = +(new Date());
        this.img.src = "http://" + ip + "/?cachebreaker=" + (+(new Date()));
        this.timer = setTimeout(function() {
            if (_that.inUse) {
                _that.inUse = false;
                _that.callback('timeout', false);
                if (--processing == 0)
                    if (window.stop) {
                        window.stop();
                    } else if (document.execCommand) {
                    document.execCommand('Stop');
                };
            }
        }, GetCheckTimeout());
    }
}

var PingModel = function(servers) {
    var addr = servers[0].address;

    // Hacky, for some reason the foreach binding fires twice.
    if (!(servers[0].name == 'Self') && alreadyProcessed.indexOf(addr) == -1) {
        alreadyProcessed.push(servers[0].address);
        return;
    }

    var serversArr = [];

    var x = servers;

    for (var i = 0; i < servers.length; i++)
        for (var j = 0; j < servers[i].length; j++)
            serversArr.push(servers[i][j]);

    var self = this;
    var myServers = [];
    var offset = 1;
    ko.utils.arrayForEach(serversArr, function(server) {
        if (!server.isMapleStoryGameServer || server.rel == subSelection || (server.rel == "Login" && (selected != 'GMS' && selected != 'MSEA'))) {
            myServers.push({
                icon: server.icon,
                name: server.name,
                sub: server.sub || false,
                interval: server.interval || false,
                address: server.address,
                port: server.port,
                unknown: server.unknown || false,
                status: ko.observable('unchecked'),
                time: ko.observable(""),
                values: ko.observableArray(),
                rel: server.rel
            });
        }
    });

    self.servers = ko.observableArray(myServers);
    processing += self.servers().length;
    ko.utils.arrayForEach(self.servers(), function(s) {
        s.status('checking');

        function doPing() {
            new ping(s.address + ":" + s.port, function(status, time, e) {
                s.status(status);
                s.time(time);
                s.values.push(time);
                if (s.name == "Self") {
                    SetPingOffset(time);
                }
                console.clear();
                /*if (s.interval) {
                	setTimeout(doPing, s.interval);
                }*/
            });
        }
        setTimeout(function() {
            doPing();
        }, checkDelay * offset++)
    });
};

var GameServer = function(version, timeOffset, icons, servers) {
    return {
        name: "Game Servers",
        description: "These are the MapleStory " + version + " game servers.",
        selectedServers: ko.observable(loadingArr),
        icons: icons,
        timeOffset: timeOffset,
        content: function() {
            return new PingModel(servers)
        }
    }
}

var servers = {
    THMS: {
        Login: [{
            icon: "Mushroom.png",
            name: "Login",
            address: "175.207.0.34",
            port: "8484",
            interval: 5000,
            values: [],
            isMapleStoryGameServer: true,
            rel: "Login"
        }],
        'สคาเนีย': [{
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 1",
                address: "13.228.80.96",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 2",
                address: "13.228.80.96",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 3",
                address: "13.228.76.20",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 4",
                address: "13.228.76.20",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 5",
                address: "13.228.42.166",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 6",
                address: "13.228.42.166",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 7",
                address: "13.228.52.228",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 8",
                address: "13.228.52.228",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 9",
                address: "13.228.80.94",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 10",
                address: "13.228.80.94",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 11",
                address: "13.228.80.27",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 12",
                address: "13.228.80.27",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 13",
                address: "13.228.45.25",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 14",
                address: "13.228.45.25",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 15",
                address: "13.228.80.54",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 16",
                address: "13.228.80.54",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 17",
                address: "13.228.45.138",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 18",
                address: "13.228.45.138",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 19",
                address: "13.228.58.55",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
			{
                icon: "Scania.png",
                english: "Scania",
                name: "Channel 20",
                address: "13.228.58.55",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },
            {
                icon: "Scania.png",
                english: "Scania",
                name: "Cash Shop - ปิดใช้งาน",
                address: "ahri.in.th",
                port: "8780",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "สคาเนีย"
            },			
        ],
        // IE fails here, that's why the Korean text is wrapped in quotes.
        'เบร่า': [{
                icon: "Bera.png",
                english: "Bera",
                name: "Channel 1",
                address: "175.207.0.70",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "เบร่า"
            },
            {
                icon: "Bera.png",
                english: "Bera",
                name: "Ch. 20세이상",
                address: "175.207.0.70",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "เบร่า"
            }
        ],
        'ลูน่า': [{
                icon: "Luna.png",
                english: "Luna",
                name: "Channel 1",
                address: "175.207.0.80",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "ลูน่า"
            },
            {
                icon: "Luna.png",
                english: "Luna",
                name: "Ch. 20세이상",
                address: "175.207.0.80",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "ลูน่า"
            }
        ],
        'เซนิท': [{
                icon: "Zenith.png",
                english: "Zenith",
                name: "Channel 1",
                address: "175.207.0.85",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "เซนิท"
            },
            {
                icon: "Zenith.png",
                english: "Zenith",
                name: "Ch. 20세이상",
                address: "175.207.0.85",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "เซนิท"
            }
        ],
        'โครอา': [{
                icon: "Croa.png",
                english: "Croa",
                name: "Channel 1",
                address: "175.207.0.90",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "โครอา"
            },
            {
                icon: "Croa.png",
                english: "Croa",
                name: "Ch. 20세이상",
                address: "175.207.0.90",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "โครอา"
            }
        ],
        'อิลิเซียม': [{
                icon: "Elysium.png",
                english: "Elysium",
                name: "Channel 1",
                address: "175.207.0.140",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "อิลิเซียม"
            },
            {
                icon: "Elysium.png",
                english: "Elysium",
                name: "Ch. 20세이상",
                address: "175.207.0.140",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "อิลิเซียม"
            }
        ],
        'อิโนซิส': [{
                icon: "Enosis.png",
                english: "Enosis",
                name: "Channel 1",
                address: "175.207.0.165",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "อิโนซิส"
            },
            {
                icon: "Enosis.png",
                english: "Enosis",
                name: "Ch. 20세이상",
                address: "175.207.0.165",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "อิโนซิส"
            }
        ],
        'เรด': [{
                icon: "Red.png",
                english: "Red",
                name: "Channel 1",
                address: "175.207.0.235",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "เรด"
            },
            {
                icon: "Red.png",
                english: "Red",
                name: "Ch. 20세이상",
                address: "175.207.0.235",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "เรด"
            }
        ],
        'ออโรรา': [{
                icon: "Aurora.png",
                english: "Aurora",
                name: "Channel 1",
                address: "175.207.0.230",
                port: "8585",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "ออโรรา"
            },
            {
                icon: "Aurora.png",
                english: "Aurora",
                name: "Ch. 20세이상",
                address: "175.207.0.230",
                port: "8586",
                interval: 5000,
                values: [],
                isMapleStoryGameServer: true,
                rel: "ออโรรา"
            }
        ]
    },
}

var checker = {
    isMainPage: ko.observable(selected == "Main"),
    selected: ko.observable(selected),
    subSelection: ko.observable(subSelection),
    getDefaultSubSelectionForVersion: GetDefaultSubSelectionForVersion,
    modifySettings: ModifySettings,
    defaultSettings: DefaultSettings,
    getServersCountForApplication: GetServersCountForApplication,
    versions: [
        {
            abbr: "THMS",
            name: "Nexon MapleStory Thailand",
            available: true,
            complete: false,
            icon: "Mushroom.png",
            short: "ไทย | Thailand",
            serverCount: [
                11
            ],
            applications: [
                GameServer("Thailand", 9, [{
                        icon: "Mushroom.png",
                        name: "Login",
                        english: false,
                        sub: ""
                    },
                    {
                        icon: "Scania.png",
                        name: "สคาเนีย",
                        english: "Scania",
                        sub: "World"
                    },
					/*
                    {
                        icon: "Bera.png",
                        name: "เบร่า",
                        english: "Bera",
                        sub: "World"
                    },
                    {
                        icon: "Luna.png",
                        name: "ลูน่า",
                        english: "Luna",
                        sub: "World"
                    },
                    {
                        icon: "Zenith.png",
                        name: "เซนิท",
                        english: "Zenith",
                        sub: "World"
                    },
                    {
                        icon: "Croa.png",
                        name: "โครอา",
                        english: "Croa",
                        sub: "World"
                    },
                    {
                        icon: "Elysium.png",
                        name: "อิลิเซียม",
                        english: "Elysium",
                        sub: "World"
                    },
                    {
                        icon: "Enosis.png",
                        name: "อิโนซิส",
                        english: "Enosis",
                        sub: "World"
                    },
                    {
                        icon: "Red.png",
                        name: "เรด",
                        english: "Red",
                        sub: "World"
                    },
                    {
                        icon: "Aurora.png",
                        name: "ออโรรา",
                        english: "Aurora",
                        sub: "World"
                    }
					*/
                ], [
                    servers.THMS.Login,
                    // Not using dot notation because IE sucks.
                    servers.THMS['สคาเนีย'],
                    servers.THMS['เบร่า'],
                    servers.THMS['ลูน่า'],
                    servers.THMS['เซนิท'],
                    servers.THMS['โครอา'],
                    servers.THMS['อิลิเซียม'],
                    servers.THMS['อิโนซิส'],
                    servers.THMS['เรด'],
                    servers.THMS['ออโรรา']
                ])
            ]
        },
    ],
    updateSelectedServers: UpdateSelectedServers,
    selectedIcon: ko.observable(GetEnglishIconNameForServer(this.subSelection)),
    settings: {
        pingOffset: ko.observable(0),
        delay: ko.observable(readCookie("Delay") ? readCookie("Delay") : 100),
        clickToRefresh: ko.observable(readCookie("ClickToRefresh") == "false" ? false : false),
        fixPing: ko.observable(readCookie("FixPing") == "false" ? false : true),
        showConnection: ko.observable(readCookie("ShowConnection") == "false" ? false : true),
        showIPPort: ko.observable(readCookie("ShowIPPort") == "false" ? false : true),
        timeout: ko.observable(readCookie("Timeout") ? readCookie("Timeout") : 5000),
        showControls: ko.observable(false)
    },
    currentTime: ko.observable('<span><i class="fa fa-cog fa-spin"></i> Checking server time...</span>')
};

checker.subSelection.subscribe(function(newValue) {
    checker.selectedIcon(GetEnglishIconNameForServer(newValue));
});

if (selected != 'Main') {
    GetPingOffset();
}

ko.applyBindings(checker);

function GetEnglishIconNameForServer(serverName) {
    switch (serverName) {
        case "สคาเนีย":
            return "Scania";
        case "เบร่า":
            return "Bera";
        case "ลูน่า":
            return "Luna";
        case "เซนิท":
            return "Zenith";
        case "โครอา":
            return "Croa";
        case "อิลิเซียม":
            return "Elysium";
        case "อิโนซิส":
            return "Enosis";
        case "เรด":
            return "Red";
        case "ออโรรา":
            return "Aurora";
        case "Login":
            return "Mushroom";
        default:
            return serverName;
    }
}

function UpdateSelectedServers(parent, index, name) {
    var name = name || checker.subSelection();

    if (loadingTimers.length > index) {
        window.clearInterval(loadingTimers[index]);
    }

    if (parent.name == "Game Servers" && !clockTicking) {
        clockTicking = true;
        setInterval(function() {
            var d = new Date(),
                o = d.getTimezoneOffset() / 60;

            d.setHours(d.getHours() + o + parent.timeOffset);
            checker.currentTime('<span><i class="fa fa-clock-o"></i> Server Time</span> ' + moment(d).format('h:mm:ss') + ' <span>' + moment(d).format('A') + '</span>');
        }, 1000);
    }

    parent.selectedServers(loadingArr);
    window.location.hash = '#' + checker.selected() + '-' + name;
    subSelection = name;
    checker.subSelection(name);

    loadingTimers.push(setTimeout(function() {
        var content = parent.content();
        parent.selectedServers(parent.content().servers());
    }, 300));
}

function GetCheckTimeout() {
    return checker.settings.timeout();
}

function GetPingOffset() {
    return new PingModel([{
        icon: "Mushroom.png",
        name: "Self",
        address: "127.0.0.1",
        port: "80",
        interval: 5000,
        values: [],
        unknown: true,
        rel: "Self"
    }]);
}

function GetDefaultSubSelectionForVersion(version) {
    switch (version) {
        case 'EMS':
            return 'Luna';
        case 'GMS':
            return 'Login';
        case 'THMS':
            return 'สคาเนีย';
        case 'MSEA':
            return 'Login';
        default:
            return;
    }
}

function SetPingOffset(offset) {
    checker.settings.pingOffset(offset);
}

function ModifySettings() {
    var delay = checker.settings.delay(),
        timeout = checker.settings.timeout();

    createCookie("Delay", delay > 10000 ? 10000 : (delay < 50 ? 50 : delay), 3650);
    createCookie("Timeout", timeout > 60000 ? 60000 : (timeout < 500 ? 500 : timeout), 3650);
    createCookie("ShowIPPort", checker.settings.showIPPort(), 3650);
    createCookie("ShowConnection", checker.settings.showConnection(), 3650);
    createCookie("ClickToRefresh", checker.settings.clickToRefresh(), 3650);
    createCookie("FixPing", checker.settings.fixPing(), 3650);

    window.location.reload();
}

function DefaultSettings() {
    checker.settings.delay(checkDelay);
    checker.settings.timeout(checkTimeout);
    checker.settings.showIPPort(showIPPort);
    checker.settings.showConnection(showConnection);
    checker.settings.clickToRefresh(clickToRefresh);
    checker.settings.fixPing(fixPing);
}

function GetServersCountForApplication(version, name) {
    var v = false;
    for (var i = 0; i < checker.versions.length; i++) {
        if (checker.versions[i].name == version) {
            v = checker.versions[i];
            break;
        }
    }

    if (v == false) {
        return 0;
    }

    for (var j = 0; j < v.applications.length; j++) {
        if (v.applications[j].name == name) {
            return v.serverCount[j];
        }
    }

    return 0;
}

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}