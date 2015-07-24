/** @jsx React.DOM */
window.Posts = React.createClass({displayName: "Posts",
  render: function() {
    alert(1);
    return (
      React.createElement("ion-item", {"on-hold": "{this.props.post.hideMenu} = !{this.props.post.hideMenu}", style: "border-style: dotted !important; border-radius: 0px 1px 1px 0px !important", "on-hold": "showOptions({this.props.post.id})", "ng-repeat": "post in submissions", class: "item-text-wrap item-text-inset item-avatar item-icon-right"},
          React.createElement("img", {"ng-click": "goToLink({this.props.post});", "ng-src": "{this.props.post.thumbnail}", "err-src": "img/voat-goat.png"}),
          React.createElement("div", {"ng-click": "focus_on({this.props.post});"},
            React.createElement("div", {"ng-switch": true, on: "{this.props.post.title}"},
              React.createElement("div", {"ng-switch-default": true},
                React.createElement("h2", {style: "max-width: 200px; word-wrap:break-word;"}, this.props.post.title),
                React.createElement("i", {class: "badge badge-royal"}, this.props.post.commentCount)
              )
            ),
            React.createElement("p", null,
              React.createElement("i", {style: "font-size: 12px; color: #8870ff;"}, this.props.post.subverse), " ⋅",
              React.createElement("b", null, this.props.post.userName)
               ),
               React.createElement("p", null,
                 React.createElement("i", {style: "font-size: 12px;"}, "timeDiff(", this.props.post.date, ")"), " ⋅",
               React.createElement("b", {style: "color: #4aabe7;"}, this.props.post.upVotes), " ∫ ", React.createElement("b", {style: "color: #8870ff;"}, this.props.post.downVotes), " ∫",
               React.createElement("b", null, this.props.post.upVotes, " - ", this.props.post.downVotes)
             )
          ),
          React.createElement("div", {style: "border: 0px;", "ng-hide": "!{this.props.post.hideMenu} || !loggedIn()", class: "item item-text-center center item-animate"},
            React.createElement("br", null),
            React.createElement("div", {id: "{this.props.post.id}", class: "row"},
              React.createElement("i", {"ng-click": "save('submissions', {this.props.post.id})", class: "ion-android-star-outline col"}),
              React.createElement("i", {"ng-click": "hide('submissions', {this.props.post.id})", class: "ion-eye-disabled col col-20"}),
              React.createElement("i", {"ng-click": "report('submissions', {this.props.post.id})", class: "ion-alert-circled col col-20"}),
              React.createElement("i", {"ng-click": "vote('submission', {this.props.post.id}, 1)", class: "ion-arrow-up-a col"}),
              React.createElement("i", {"ng-click": "vote('submission', {this.props.post.id}, -1)", class: "ion-arrow-down-a col"})
            )
          )
      )
    );
  }
});
app.value('Posts', Posts);
