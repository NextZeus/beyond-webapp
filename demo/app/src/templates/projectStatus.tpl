<div class="pull-right">
<button class="btn btn-default editor-toggle" href="#">
	发表&nbsp;
	<span class="caret"></span>
</button>
</div>
<h2 class="name"><%= model.name %></h2>
<hr>
<div class="status-editor hidden">
<form>
	<div class="row">
		<div class="col-lg-12">
			<textarea class="form-control" name="text" rows="3"></textarea>
			<br>
			<input type="submit" value="发送" class="btn btn-block btn-primary"/>
		</div>

	</div>
	<hr></form>
</div>
<div class="status_list"></div>