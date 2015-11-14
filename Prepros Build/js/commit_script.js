//Class to represent a Commit Object
function Commit(data) {

    var self = this;
    self.authorUrl = ko.observable(data.author.html_url);
    self.authorAvatar = ko.observable(data.author.avatar_url);
    self.message = ko.observable((data.commit.message).substring(0,180)+"...");
    self.commitUrl = ko.observable(data.html_url);
    self.date = ko.observable(moment(data.commit.committer.date).fromNow());
    self.sha = ko.observable(data.sha);
}

//ViewModel for the commit
function CommitViewModel(){
    var self = this;
    self.today = ko.observable(moment().format("dddd, MMMM Do YYYY"));
    self.commitList = ko.observableArray();

        $.getJSON("https://api.github.com/repos/slamdata/quasar/commits", function(commits){
            for(var i=0; i < 2; i++){
                com = new Commit(commits[i]);
                self.commitList.push(com);
            }
    });
}

$(document).ready(function(){

    ko.applyBindings(new CommitViewModel(), document.getElementById("commit"));

});