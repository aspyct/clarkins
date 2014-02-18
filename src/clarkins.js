(function () {
    "use strict";

    // dependencies
    var https,
        colors,

    // functions & objects
        Jenkins,
        Screen,
        Build,
        Controller;

    https = require('https');
    colors = require('colors');

    Jenkins = function (url) {
        this.url = url;
    };
    Jenkins.prototype = {
        buildsSince: function (since, callback) {
            var build;

            build = new Build();
            build.date = new Date();
            build.job = "Performance JS";
            build.status = "stable";
            build.url = "http://www.aspyct.org";

            callback(since, [build]);
        },
        login: function (username, password) {

        }
    };

    Screen = function () {
        this.stableBuilds = 98;
        this.unstableBuilds = 23;
        this.brokenBuilds = 1;
    };
    Screen.prototype = {
        showNewBuild: function (build) {
            var time,
                colorBlock,
                width,
                text;

            switch (build.status) {
            case "stable":
                colorBlock = " ".green.inverse;
                break;
            case "unstable":
                colorBlock = " ".yellow.inverse;
                break;
            case "broken":
                colorBlock = " ".red.inverse;
                break;
            }

            width = process.stdout.columns;
            time = this.formatDate(build.date);

            text = colorBlock + " " + time + " " + build.job;
            // TODO Pad this to a fixed width
            text += this.makeWhiteBlock(width - text.length - 20);
            text += this.summary(20);

            console.log(text);
        },
        readCredentials: function () {

        },
        formatDate: function (date) {
            var hours,
                minutes,
                pad;

            pad = function (number) {
                return number > 10 ? number : "0" + number;
            };
            return pad(date.getHours()) + ":" + pad(date.getMinutes());
        },
        summary: function (width) {
            var totalBuilds,
                unstablePercentage,
                brokenPercentage,
                redBlocks,
                yellowBlocks,
                greenBlocks;

            totalBuilds = this.stableBuilds +
                            this.unstableBuilds +
                            this.brokenBuilds;

            unstablePercentage = this.unstableBuilds / totalBuilds;
            brokenPercentage = this.brokenBuilds / totalBuilds;

            redBlocks = Math.ceil(width * brokenPercentage);
            width -= redBlocks;

            yellowBlocks = Math.ceil(width * unstablePercentage);
            width -= yellowBlocks;

            greenBlocks = width;

            return this.makeColorBlock("green", greenBlocks) +
                    this.makeColorBlock("yellow", yellowBlocks) +
                    this.makeColorBlock("red", redBlocks);
        },
        makeColorBlock: function (color, size) {
            return this.makeWhiteBlock(size)[color].inverse;
        },
        makeWhiteBlock: function (size) {
            return new Array(size + 1).join(" ");
        }
    };

    Build = function () {
        this.job = null;
        this.success = null;
        this.url = null;
    };

    Controller = function (jenkins, screen) {
        this.jenkins = jenkins;
        this.screen = screen;
        this.refreshInterval = 10;
    };
    Controller.prototype = {
        main: function () {
            this.refresh();
            setInterval(this.refresh.bind(this), this.refreshInterval * 1000);
        },
        refresh: function () {
            var self = this;

            this.jenkins.buildsSince(this.lastRefresh, function (since, builds) {
                self.lastRefresh = since;
                builds.forEach(function (build) {
                    self.screen.showNewBuild(build);
                });
            });
        }
    };

    if (require.main === module) {
        (function () {
            var jenkins,
                screen,
                controller;

            jenkins = new Jenkins("http://...");
            screen = new Screen();
            controller = new Controller(jenkins, screen);
            controller.main();
        }());
    }
}());
