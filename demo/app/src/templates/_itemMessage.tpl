<div class="media">
	<% if(ui.showToUser){ %>
	<div class="pull-left">
		<a href="#profile/<%= model.to.uid %>
			">
			<img class="media-object" src="<%= model.to.avatar %>" width="64px;" height="64px;"></a>
	</div>
	<% }else{ %>
	<div class="pull-left">
		<a href="#profile/<%= model.from.uid %>
			">
			<img class="media-object" src="<%= model.from.avatar %>" width="64px;" height="64px;"></a>
	</div>
	<% } %>
	<div class="media-body">

		<% if(ui.showToUser){ %>
			<h4 class="media-heading">
				<a href="#space/<%= model.to.uid %>
					">
					<%= model.to.username %></a>&nbsp;<i class="fa fa-chevron-left small"></i><i class="fa fa-chevron-left small"></i>&nbsp;<span class="small">我</span>
			</h4>
		<% }else{ %>
			<h4 class="media-heading">
				<a href="#space/<%= model.from.uid %>
					">
					<%= model.from.username %></a>&nbsp;<i class="fa fa-chevron-right small"></i><i class="fa fa-chevron-right small"></i>&nbsp;<span class="small">我</span>
			</h4>
		<% } %>
		<%= model.content %>
		<p>
			<%= model.deltatime %>
			<span class="pull-right">
					<a class="comment-toggle"> <i class="fa fa-pencil-square-o"></i>
						&nbsp;回复
					</a>
			</span>
		</p>
		<div class="comment-editor"></div>
		<div class="comments"></div>
	</div>
	<div class="media-right"></div>
</div>
<hr>