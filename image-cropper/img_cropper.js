/**
 * @author guanfeng_yang 简单的弹出框图片预览裁剪工具（依赖jquery和layer,ajaxform）
 * @param $selector
 * @constructor
 */
function PopCroper($selector) {
    // layer声明
    layui.use('layer', function () {
        var layer = layui.layer;
    });
    this.$container = $($selector); //初始化cropper的选择器
    this.settings = {};
    this.cropData = null;
}
PopCroper.prototype = {
    constructor: PopCroper,
    support: {
        fileList: !!$('<input type="file">').prop('files'),
        blobURLs: !!window.URL && URL.createObjectURL,
        formData: !!window.FormData
    },
    init: function (settings) {
        this.support.datauri = this.support.fileList && this.support.blobURLs;
        this.settings = settings;
        this.settings.imgType = settings.imgType || 'jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF';
        this.initPop();
        this.addListener();
    },
    initPop: function () {
        var popId = "pop_crop_" + new Date().getTime();
        var popHtml = "<div id='" + popId + "'>";
        popHtml += '<form id = "' + popId + '_form" novalidate enctype="multipart/form-data">';
        popHtml += '<div style="margin-top: 15px;padding: 0 20px;"><input name="file" type="file">';
        popHtml += '<input name="x"   style="display: none">';
        popHtml += '<input name="y"  style="display: none">';
        popHtml += '<input name="w"  style="display: none">';
        popHtml += '<input name="h"  style="display: none">';
        //popHtml += '<input name="resizeWidth" value="'+this.settings.width+'" style="display: none">';
        //popHtml += '<input name="resizeHeight" value="'+this.settings.height+'" style="display: none">';
        popHtml += '</div></form>';
        popHtml += '<div class="layui-row">';
        if(this.settings.showPreview == false){
            //不预览的情况
            popHtml += '<div class="" style="padding: 0 15px;height: 420px" ><div class="img-wrapper"></div></div>';
        }else{
            popHtml += '<div class="layui-col-md8" style="padding: 0 15px;" ><div class="img-wrapper"></div></div>';
            popHtml += '<div class="layui-col-md4" style="padding: 0 15px">';
            popHtml += '<div class="img-preview preview-lg"></div>';
            popHtml += '<div class="img-preview preview-md"></div>';
            popHtml += '<div class="img-preview preview-sm"></div></div>';
        }
        popHtml += '</div></div>';
        this.contentId = "#" + popId;
        this.settings.content = popHtml;
    },
    addListener: function () {
        if(this.settings.click){
            var clickfnc = this.settings.click;
            var obj = this;
            this.$container.unbind('click').bind('click', function () {
                if(clickfnc()){
                    obj.click();
                }
            });
        }else{
            this.$container.unbind('click').bind('click', $.proxy(this.click, this)); //弹出框点击事件
        }
        if (this.$fileInput) this.$fileInput.unbind('click').bind('change', $.proxy(this.change, this)); //选择文件change事件
    },
    initPreview: function () { //初始化预览图
    },
    click: function () { //pop layer
        var _this = this;
        var settings = {
            title: this.settings.title ,
            type: 1,
            btn: this.settings.btn || ['确认', '取消'],
            area: this.settings.area || '900px',
            btnAlign: 'c',
            zIndex: 999,
            maxWidth: '1200px',
            shadeClose: false,
            content: this.settings.content,
            maxmin: true,
            success: function (e) {
                var css = $(e).find(".layui-col-md4").css("height");
                $(".img-wrapper").css("height", css);
                _this.$imgWrapper = $(_this.contentId + " .img-wrapper");
                _this.imgPreview = _this.contentId + " .img-preview";
                _this.$imgForm = $(_this.contentId + " form");
                _this.$fileInput = $(_this.contentId + " input[type=file]");
                _this.addListener();
            },
            yes: function () {
                if (!_this.cropData) {
                    _this.errorMsg("请选择图片");
                    return;
                }
                var files = _this.$fileInput.prop('files');
                var file = files[0];
				var maxSize = _this.settings.maxSize || 5;
                if(file.size> 1024 * 1024 * maxSize){
                    _this.errorMsg("上传图片不能超过" + maxSize + "M!");
                    return;
                }
				var before = _this.settings.before;
				var data = _this.cropData;
				if(before && before(data)===false) return false;
				
				var $imgForm = _this.$imgForm;
				$imgForm.find("input[name=x]").val(Math.round(data.x));
                $imgForm.find("input[name=y]").val(Math.round(data.y));
                $imgForm.find("input[name=h]").val(Math.round(data.height));
                $imgForm.find("input[name=w]").val(Math.round(data.width));

                _this.$imgForm.ajaxSubmit({
                    type: "POST",
                    url: _this.settings.uploadURL,
                    dataType: "json",
                    beforeSend:function () {
                      layer.load(2);
                    },
                    success: function (data) {
                        _this.settings.success(data);
                    },complete:function () {
                        setTimeout(function () {
                            layer.closeAll('loading');
                        },500);
                    }
                });
            },
            end: function () {
                _this.stopCropper();
            }
        };
        layer.open(settings);
        this.initPreview();
    },
    change: function () {
        var files, file;
        files = this.$fileInput.prop('files');
        if (files.length > 0) {
            file = files[0];
            if(file.size> 1024 * 1024 *10){
                this.stopCropper();
                this.errorMsg("上传图片不能超过10M!");
                return;
            }
            if (this.isImageFile(file)) {
                if (this.url) {
                    window.URL.revokeObjectURL(this.url);
                }
                this.url = window.URL.createObjectURL(file);
                this.startCropper();
            } else {
                this.stopCropper();
                this.errorMsg("只能上传" + this.settings.imgType + "类型的图片");
            }
        }else{
            this.stopCropper();
        }
    },
    startCropper: function () {
        var _this = this;
        if (_this.active) {
            _this.$img.cropper('replace', _this.url);
        } else {
            _this.$img = $('<img src="' + _this.url + '">');
            _this.$imgWrapper.empty().html(_this.$img);
            _this.settings.preview = _this.imgPreview;
            _this.settings.crop = function (data) {
                _this.cropData = data;
            };
            _this.$img.cropper(_this.settings);
            _this.active = true;
        }
    },
    stopCropper: function () {
        if (this.active) {
            this.$img.cropper('destroy');
            this.$img.remove();
            this.active = false;
            this.cropData = null;
        }
    },
    isImageFile: function (file) {
        var name = file.name;
        var type = name.substr(name.lastIndexOf('.')+1).toLowerCase();
        if(this.settings.imgType.indexOf(type) ==-1){
            return false;
        }else{
            return true;
        }
    },
    errorMsg: function (msg) {
        layer.msg(msg, {time: 1500, icon: 2, anim: 6});
    }
};