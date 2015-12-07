<div>
	<div id="indexTemplate">
		<div class="panel panel-default">
			<div class="pull-right">
				<button class="btn btn-primary add">新增</button>
			</div>
			<div class="panel-heading">
				<h4 class="panel-title text-center">组织管理</h4>
			</div>
			<div class="panel-body">
				<div id="search">
				</div>
				<div id="list">
					<hr/>
					<div class="pull-right">
						<button class="btn btn-success edit">编辑</button>
						<button class="btn btn-danger delete">删除</button>
					</div>
					<h4>组织名称</h4>
					<p>组织编码，状态</p>
				</div>
			</div>
		</div>
	</div>	
	<div id="searchTemplate">
		<form id="searchForm" class="form-inline">
			<div class="form-group">
				<label>搜索：</label>
				<input type="text" name="searchStr" class="form-control" placeholder="组织名称或组织代码">
			</div>
			<div class="form-group">
				<input type="hidden" name="status[code]" value="0">
				<input type="checkbox" name="status[code]" value="1">有效
			</div>
			<div class="form-group">
				<input type="submit" value="查询" class="btn btn-info">
			</div>
		</form>
	</div>
	<div id="itemTemplate">
		<hr/>
		<div class="pull-right">
			<button class="btn btn-success edit">编辑</button>
			<button class="btn btn-danger delete">删除</button>
		</div>
		<h4>组织名称</h4>
		<p>组织编码，状态</p>
	</div>
	<div id="addTemplate">
		<div class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title text-center">新增组织</h4>
			</div>
			<div class="panel-body">
				<form id="roleForm">
					<div class="form-group">
						<label>组织名称：</label>
						<input type="text" name="name" value="" class="form-control">
						<span class="help-block"></span>
					</div>
					<div class="form-group">
						<label>组织描述：</label>
						<input type="text" name="description" value="" class="form-control">
						<span class="help-block"></span>
					</div>
					<div class="form-group">
						<label>组织归属：</label>
						<div style="padding-left:30px;">
							<input type="checkbox" name="feature[]" value="">&nbsp;后台支撑&nbsp;
							<input type="checkbox" name="feature[]" value="">&nbsp;渠道支撑&nbsp;
						</div>
					</div>
					<div class="form-group">
						<label>状态：</label>
						<div style="padding-left:30px;">
							<input type="hidden" name="status[code]" value="0">
							<input type="checkbox" name="status[code]" value="1">有效
						</div>
					</div>
					<div class="form-group">
						<div class="btn-group btn-group-justified">
							<div class="btn-group">
							<input type="submit" value="提交" class="btn btn-danger">
						</div>
						<div class="btn-group">
							<input type="cancel" value="取消" class="btn btn-primary">
						</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>