/**
 * Created by ManasB on 6/28/2015.
 */

define([
    "underscore",
    "jquery",
    "backbone",
    "models/post"
], function (_, $, Backbone, PostModel) {
    var PostsCollection = Backbone.Collection.extend({
        model: PostModel,
        fetch: function (subreddit, sort, shouldLoadMore) {
            // reset 'after' value if subreddit or sort has been changed
            if (this.subreddit != subreddit || this.sort != sort) {
                this.after = undefined;
            }

            this.subreddit = subreddit;
            this.sort = sort;
            this.shouldLoadMore = shouldLoadMore;

            // build posts url
            var postsUrl = this.subreddit == "Front page" ? "/api/posts?sort=" + this.sort : "/api/posts/" + this.subreddit + "?sort=" + this.sort;
            if (shouldLoadMore && this.after) {
                postsUrl += "&after=" + this.after;
            }
            if (localStorage.getItem("username")) {
                postsUrl += "&session=" + localStorage.getItem("session");
            }

            this.fetchPostsAjax(postsUrl);
        },
        fetchPostsAjax: function (postsUrl) {
            var self = this;
            $.ajax({
                url: postsUrl,
                method: "GET",
                dataType: "json",
                timeout: 6000,
                success: function (response) {
                    if (self.shouldLoadMore) {
                        if (self.after != null) {
                            self.add(response.posts);
                        }
                    } else {
                        self.reset(response.posts);
                    }

                    self.after = response.after;

                    if (self.after == null) {
                        self.trigger("no.more.posts.to.load");
                    }
                },
                error: function (jqXHR, textStatus, error) {
                    if (textStatus == "timeout") {
                        console.log("timed out");
                        setTimeout(function () {
                            self.fetchPostsAjax(postsUrl);
                        }, 1000);

                    } else {
                        self.trigger("error", error);
                    }
                }
            });
        }
    });

    return new PostsCollection();
});