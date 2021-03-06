<div class="sidebar sidebar-left">
	<div class="scrollable" style="padding-top:70px;">
		<div class="scrollable-header app-name">
			<a href="#" onclick="window.location.reload();return false;">白杨投资理财</a>
		</div>
		<div class="scrollable-content">
			<div class="list-group">
				<a class="list-group-item active" href="#index"> <i class="fa fa-users fa-fw"></i>
					&nbsp;首页
					<span class="pull-right">
						<i class="fa fa-chevron-right"></i>
					</span>
				</a>
				<a class="list-group-item" href="#trade/portfolio/index">
					<i class="fa fa-meh-o fa-fw"></i>
					&nbsp;投资组合
					<i class="fa fa-chevron-right pull-right"></i>
				</a>
				<a class="list-group-item" href="#trade/order/index">
					<i class="fa fa-meh-o fa-fw"></i>
					&nbsp;下单记录
					<i class="fa fa-chevron-right pull-right"></i>
				</a>
				<a class="list-group-item" href="#trade/portfolio/histroy/index">
					<i class="fa fa-meh-o fa-fw"></i>
					&nbsp;往届投资
					<i class="fa fa-chevron-right pull-right"></i>
				</a>
				<a class="list-group-item" href="#trade/transaction/index">
					<i class="fa fa-meh-o fa-fw"></i>
					&nbsp;撮合记录
					<i class="fa fa-chevron-right pull-right"></i>
				</a>
				<a class="list-group-item" href="#trade/strategy/index">
					<i class="fa fa-meh-o fa-fw"></i>
					&nbsp;策略管理
					<i class="fa fa-chevron-right pull-right"></i>
				</a>
				<a class="list-group-item" href="#trade/account/index">
					<i class="fa fa-meh-o fa-fw"></i>
					&nbsp;账户管理
					<i class="fa fa-chevron-right pull-right"></i>
				</a>
				<a class="list-group-item" href="#profile/me">
					<i class="fa fa-meh-o fa-fw"></i>
					&nbsp;我的资料
					<i class="fa fa-chevron-right pull-right"></i>
				</a>
			</div>
			<div id="projectlist"></div>
			<br/>
			<br/>
			<br/>
		</div>
	</div>
</div>

<div class="sidebar sidebar-right">
	<div class="scrollable" style="padding-top:70px;">
		<div class="scrollable-header app-name">
			待办事宜
			<a href="#friends" class="pull-right">
				<i class="fa fa-search"></i>
				管理
			</a>
		</div>
		<div class="scrollable-content">
			<div id="chat" class="list-group"></div>
		</div>
	</div>
</div>
<div class="app">
	<div class="navbar navbar-app navbar-absolute-top">
		<div class="navbar-brand navbar-brand-center">{产品名称}</div>
		<div class="btn-group pull-left">
			<div class="btn sidebar-toggle" id="left-sidebar-toggle">
				<i class="fa fa-bars fa-lg"></i>
				&nbsp;菜单
			</div>
		</div>
		<div class="btn-group pull-right">
			<div class="btn" id="right-sidebar-toggle">
				<i class="fa fa-comment fa-lg"></i>
				&nbsp;提醒
			</div>
		</div>
	</div>
	<div class="navbar navbar-app navbar-absolute-top" id="deviceready" style="display:none;">
		<div class="navbar-brand-center">
			<h4 class="bg-warning">网络不通</h4>
		</div>
	</div>
	<div class="app-body">
		<div class="app-content">
			<div class="scrollable">
				<div id="content" class="scrollable-content section"></div>
			</div>
		</div>
	</div>
</div>