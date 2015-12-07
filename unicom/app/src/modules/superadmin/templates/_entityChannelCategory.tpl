<div>
	<div id="indexTemplate">
		<div class="panel panel-default">
			<div class="pull-right">
				<button class="btn btn-primary add">新增</button>
			</div>
			<div class="panel-heading">
				<h4 class="panel-title text-center">渠道类型</h4>
			</div>
			<div class="panel-body">
				<div id="list">
					<hr/>
					<div class="pull-right">
						<button class="btn btn-success edit">编辑</button>
						<button class="btn btn-danger delete">删除</button>
					</div>
					<h4>渠道名称</h4>
					<p>状态</p>
				</div>
			</div>
		</div>
	</div>	
	<div id="itemTemplate">
		<hr/>
		<div class="pull-right">
			<button class="btn btn-success edit">编辑</button>
			<button class="btn btn-danger delete">删除</button>
		</div>
		<h4>渠道名称</h4>
		<p>状态</p>
	</div>
	<div id="addTemplate">
		<div class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title text-center">新增渠道类型</h4>
			</div>
			<div class="panel-body">
				<form id="roleForm">
					<div class="form-group">
						<label>渠道名称：</label>
						<input type="text" name="name" value="" class="form-control">
						<span class="help-block"></span>
					</div>
					<div class="form-group">
						<label>渠道描述：</label>
						<input type="text" name="description" value="" class="form-control">
						<span class="help-block"></span>
					</div>
					<div class="form-group">
						<label>渠道权限：</label>
						<div style="padding-left:30px;">
							<input type="checkbox" name="feature[]" value="">&nbsp;权限管理&nbsp;
							<input type="checkbox" name="feature[]" value="">&nbsp;物料管理&nbsp;
							<input type="checkbox" name="feature[]" value="">&nbsp;报表管理&nbsp;
							<input type="checkbox" name="feature[]" value="">&nbsp;报表管理&nbsp;
							<input type="checkbox" name="feature[]" value="">&nbsp;报表管理&nbsp;
							<input type="checkbox" name="feature[]" value="">&nbsp;报表管理&nbsp;
							<input type="checkbox" name="feature[]" value="">&nbsp;报表管理&nbsp;
							<input type="checkbox" name="feature[]" value="">&nbsp;报表管理&nbsp;
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