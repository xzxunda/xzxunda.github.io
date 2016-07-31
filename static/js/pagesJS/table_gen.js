/**
 * Created by Badger on 16/7/27.
 */

function TableGen() {
}

TableGen.prototype.setTable = function (inTable) {

}
TableGen.prototype.success = 'success';
TableGen.prototype.error = 'error';
TableGen.prototype.tableID = 'table';
TableGen.prototype.modalName = 'myModal';
TableGen.prototype.editFields = new Array();

TableGen.prototype.validates;


//
TableGen.prototype.bind = function () {
    this.createOrUpdate();
    window.onload = this.init();
}

//初始化Table的主函数
TableGen.prototype.init = function () {
    var $table = $('#' + this.tableID);
    var $remove = $('#remove');
    var selections = [];

    this.setTable($table);

    setTimeout(function () {
        $table.bootstrapTable('resetView');
    }, 200);

    $table.on('check.bs.table uncheck.bs.table ' +
        'check-all.bs.table uncheck-all.bs.table', function () {
        $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
        // save your data, here just save the current page
        selections = getIdSelections();
        // push or splice the selections if you want to save all data selections
    });

    //'删除已选'按钮操作
    $remove.click(function () {
        var ids = getIdSelections();
        bootbox.setLocale("zh_CN");
        bootbox.confirm({
            size: 'small',
            message: "确认删除已选记录吗？",
            callback: function (result) {
                if (result) {
                    for (var idx in ids) {
                        deleteItem(apiUrl, ids[idx]);
                    }
                    $table.bootstrapTable('remove', {
                        field: 'id',
                        values: ids
                    });
                    $remove.prop('disabled', !getIdSelections().length);
                }
            }
        });
    });

    //'添加'按钮操作，清除模态框内的数据
    $("#add").click(function () {
        //清除form表单中原来的数据
        $(':input', '#myForm')
            .not(':button, :submit')
            .val('')
            .removeAttr('checked')
            .removeAttr('selected');
    });

    $(window).resize(function () {
        $table.bootstrapTable('resetView', {
            height: $(window).height()
        });
    });
    function getIdSelections() {
        return $.map($table.bootstrapTable('getSelections'), function (row) {
            return row.id
        });
    }

};

//预设初始化编辑列方法
TableGen.prototype.operateFormatter = function (value, row, index) {
    return [
        '<a class="edit" href="javascript:void(0)" title="修改">',
        '<i class="glyphicon glyphicon-edit"></i>',
        '</a>&nbsp;&nbsp;&nbsp;',
        '<a class="remove" href="javascript:void(0)" title="删除">',
        '<i class="glyphicon glyphicon-remove"></i>',
        '</a>'
    ].join('');
};

// 预设编辑事件方法
TableGen.prototype.operationEvent = function () {
    var $modal = $('#' + this.modalName);
    var fields = this.editFields;
    window.operateEvents = {
        'click .edit': function (e, value, row, index) {
            for (var item in fields) {
                $('#' + fields[item]).val(row[fields[item]]);
            }
            $modal.modal('show');
        },
        'click .remove': function (e, value, row, index) {
            var id = [row.id];
            bootbox.setLocale("zh_CN");
            bootbox.confirm({
                size: 'small',
                message: "确认删除已选记录吗？",
                callback: function (result) {
                    if (result) {
                        deleteItem(apiUrl, id);
                    }
                }
            });
        }
    };
    return window.operateEvents;
};

//angular提交创建记录或修改记录的方法
TableGen.prototype.createOrUpdate = function () {
    var app = angular.module("app", []);
    var fields = this.editFields;
    var val = this.validates;
    app.controller("ctrl", function ($scope, $http) {
        $scope.saveObj = function () {
            var rules = val;
            new validate({
                rules: rules,
                focusInvalid : false,
                submitFun: function () {
                    var params = '';
                    for (var item in fields) {
                        params += '"' + fields[item] + '":"' + $('#' + fields[item]).val() + '",'
                    }
                    params = params.substring(0, params.length - 1);
                    params = "{" + params + "}";
                    params = JSON.parse(params);
                    var id = $('#id').val();//取得隐藏id控件的值，用来判断saveOrg方法是创建记录，还是还是修改记录
                    console.log("id:" + id);
                    console.log("传入的参数：" + params);
                    if (id != "") {  //修改
                        var url = apiUrl + '/' + id;
                        updateItem(url, params, $http);
                    } else {    //创建
                        var url = apiUrl;
                        saveItem(url, params, $http);
                    }
                    $('#myModal').modal('hide');
                }
            })
        }
    });
}

//创建一条记录的方法
function saveItem(url, params, $http) {
    var $table = $('#' + TableGen.prototype.tableID);
    //$http.defaults.headers.post['Content-Type'] = 'application/json';
    $http.post(url, params, {
        'Content-Type': "application/json"
    }).success(function (data, state) {
        console.log(data);
        console.log(state);
        if (state == '201') {
            alertTip(TableGen.prototype.success);
            $table.bootstrapTable('refresh', {url: apiUrl});
        } else {
            alertTip(TableGen.prototype.error);
        }
    }).error(function (data) {
        console.log("err result:" + JSON.stringify(data));
        alertTip(TableGen.prototype.error);
    });
}

//修改一条记录的方法
function updateItem(url, params, $http) {
    var $table = $('#' + TableGen.prototype.tableID);
    $http.put(url, params, {
        'Content-Type': "application/json",
        "X-HTTP-Method-Override": "PUT"
    }).success(function (data, state) {
        console.log(state);
        console.log("success result:" + data);
        if (state == '205') {
            alertTip(TableGen.prototype.success);
            $table.bootstrapTable('refresh', {url: apiUrl});
        } else {
            alertTip(TableGen.prototype.error);
        }
    }).error(function (data) {
        console.log("err result:" + JSON.stringify(data));
        alertTip(TableGen.prototype.error);
    });
}


//删除一条记录的方法
function deleteItem(apiUrl, id) {
    var $table = $('#' + TableGen.prototype.tableID);
    var url = apiUrl + "/" + id;
    $.ajax({
        url: url,
        type: 'DELETE',
        success: function (result, state) {
            console.log("状态：" + state);
            //console.log("返回删除对象："+JSON.stringify(result));
            if (state == 'success') {
                alertTip(TableGen.prototype.success);
                $table.bootstrapTable('remove', {
                    field: 'id',
                    values: id
                });
            }
        },
        error: function (result) {
            alertTip(TableGen.prototype.error);
            console.log(result);
        }
    });
}
