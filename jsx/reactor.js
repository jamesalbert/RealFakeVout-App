/** @jsx React.DOM */
var Posts = React.createClass({
  render: function() {
    var scope = this.props.scope;
    return (
      <ion-item on-hold="{this.props.post.hideMenu} = !{this.props.post.hideMenu}" style="border-style: dotted !important; border-radius: 0px 1px 1px 0px !important" on-hold="showOptions({this.props.post.id})" ng-repeat="post in submissions" class="item-text-wrap item-text-inset item-avatar item-icon-right">
          <img ng-click="goToLink({this.props.post});" ng-src="{this.props.post.thumbnail}" err-src="img/voat-goat.png" />
          <div ng-click="focus_on({this.props.post});">
            <div ng-switch on="{this.props.post.title}">
              <div ng-switch-default>
                <h2 style="max-width: 200px; word-wrap:break-word;">{this.props.post.title}</h2>
                <i class="badge badge-royal">{this.props.post.commentCount}</i>
              </div>
            </div>
            <p>
              <i style="font-size: 12px; color: #8870ff;">{this.props.post.subverse}</i> &sdot;
              <b>{this.props.post.userName}</b>
               </p>
               <p>
                 <i style="font-size: 12px;">timeDiff({this.props.post.date})</i> &sdot;
               <b style="color: #4aabe7;">{this.props.post.upVotes}</b> &int; <b style="color: #8870ff;">{this.props.post.downVotes}</b> &int;
               <b>{this.props.post.upVotes} - {this.props.post.downVotes}</b>
             </p>
          </div>
          <div style="border: 0px;" ng-hide="!{this.props.post.hideMenu} || !loggedIn()" class="item item-text-center center item-animate">
            <br/>
            <div id="{this.props.post.id}" class="row">
              <i ng-click="save('submissions', {this.props.post.id})" class="ion-android-star-outline col"></i>
              <i ng-click="hide('submissions', {this.props.post.id})" class="ion-eye-disabled col col-20"></i>
              <i ng-click="report('submissions', {this.props.post.id})" class="ion-alert-circled col col-20"></i>
              <i ng-click="vote('submission', {this.props.post.id}, 1)" class="ion-arrow-up-a col"></i>
              <i ng-click="vote('submission', {this.props.post.id}, -1)" class="ion-arrow-down-a col"></i>
            </div>
          </div>
      </ion-item>
    );
  }
});
app.value('Posts', Posts);
