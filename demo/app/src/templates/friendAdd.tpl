<p>查找已经在平台上注册的同事和朋友，将他加入到您的通讯录，或邀请他加入到您的项目。</p>
<p> <strong>注意：</strong>
	我们假定采用相同邮件地址后缀的人是属于同一个工作团队的必要条件，所以您只能查找与您注册的邮箱地址后缀相同的好友。如果你的同事或好友还没有注册到该平台，请
	<a href="#friend/invite">邀请他加入</a>
	。
</p>
<hr>
<div class="" id="search">
	<form class="">
		<div class="form-group">
			<div class="input-group">
				<input type="text" name="searchStr" class="form-control" placeholder="姓名或邮件" />
				<span class="input-group-addon">
					<%= account.email.substr(account.email.indexOf('@')) %></span>
			</div>
		</div>
		<input type="submit" value="搜索" class="btn btn-info btn-block"/>
	</form>
</div>
<p></p>
<div id="list"></div>