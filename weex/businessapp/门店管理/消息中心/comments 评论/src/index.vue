<template>
    <div class="wrapper">
        <div class="minibar">
            <wxc-minibar
                    background-color="#53beb7"
                    text-color="#fff"
                    @wxcMinibarLeftButtonClicked="backClick"
                    v-once
            >
                <image :style="GLOBAL.headerImg"  slot="left"
                       src="https://image.aftdc.com/appBimg/icon_back_normal.png"></image>
                <text :style="GLOBAL.headerCenter"  slot="middle">评论</text>
                <!--<text :style="GLOBAL.headerRight"  slot="right">帮助</text>-->
            </wxc-minibar>
        </div>
        <list class="scroller" offset-accuracy="10" @scroll="scrollHandler">
            <cell class="masking" v-for="(item,index) in pinglunData" @touchstart="ontouchstart(item.id,index)" @touchend="ontouchend">
                <div class="masks">
                    <div>
                        <image class="touxiang" :src="item.userPhoto"></image>
                    </div>
                    <div class="right">
                        <div style="flex-direction: row;justify-content: space-between;align-items: center;width: 550px;">
                            <div>
                                <text class="userName" :style="{fontSize:GLOBAL.biggerFS,color:GLOBAL.tColor}">{{item.userName}}</text>
                            </div>
                            <div>
                                <text :style="{fontSize:GLOBAL.defaultFS,color:'#999'}">{{item.time}}</text>
                            </div>
                        </div>
                        <div>
                            <text class="action"  :style="{fontSize:GLOBAL.bigFS,color:GLOBAL.dColor}">评论内容：{{item.content}}</text>
                            <text class="action"  :style="{fontSize:GLOBAL.bigFS,color:GLOBAL.dColor}">《{{item.title}}》</text>
                        </div>
                    </div>
                </div>
            </cell>
            <loading class="loading" @loading="onloading" :display="loadinging ? 'show' : 'hide'">
                <text class="indicator-text" :style="{fontSize:GLOBAL.bigFS,color:'#999'}">加载中</text>
            </loading>
        </list>

        <!-- 评论删除提示框 -->
        <wxc-mask height="322"
                  width="566"
                  border-radius="0"
                  duration="100"
                  mask-bg-color="#FFFFFF"
                  :has-animation="hasAnimation"
                  :has-overlay="true"
                  :show-close="false"
                  :show="show"
                  :overlay-cfg="overlay"
                  @wxcMaskSetHidden="wxcMaskSetHidden">
            <div class="mask" @click.stop="">
                <text class="maskTitle">提示</text>
                <text class="maskContent">确定删除此评论消息？</text>
                <div class="maskBtn row">
                    <text class="maskSure" @click="wxcMaskSetHidden">取消</text>
                    <text class="maskCancel" @click="commentDelect">确定</text>
                </div>
            </div>
        </wxc-mask>
        <toast ref="toast"></toast>

    </div>
</template>

<script>
    import {WxcMinibar, WxcButton,WxcMask} from 'weex-ui';
    import Toast from './Toast.vue'
    const navigator = weex.requireModule('navigator');
    const event = weex.requireModule('event');
    const post = weex.requireModule('stream');
    var timer = null;
    export default {
        components: {WxcMinibar, WxcButton,Toast,WxcMask},
        data() {
            return {
                backImgToggle: 0,//头部返回图片判断
                pinglunData: [],
                loadinging: false,
                loadingingType: 1,
                page: 0,
                type: 3,
                token:'',
                imei:'',

                // 评论删除弹出层
                show: false,
                overlayCanClose: true,
                isFalse: false,
                hasAnimation: true,
                overlay: {
                    duration: 100
                },
                delId: '',
                delIndex: ''
            }
        },
        created: function() {
            this.token = weex.config.token;
            this.imei = weex.config.imei;
            var param = this.GLOBAL.sign(this.token,this.imei);
            var that = this;
            var type = that.type;
            var page = that.page;
            param += '&type=' + type;
            param += '&page=' + page;
            post.fetch({
                method: 'POST',
                type: 'json',
                body: param,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                url: 'https://www.aftdc.com/businessapp/Store/getMessageDetails',
            }, function (e) {
                if(e.data.res === 1) {
                    var pinglunData = e.data.data;
                    that.page += e.data.page;
                    if (pinglunData.length !== 10) {
                        that.loadingingType = 0;
                    }
                    that.pinglunData = that.pinglunData.concat(pinglunData);
                } else if(e.data.res === 0) {
                    that.loadingingType = 0;
                } else {
                    const toast = that.$refs.toast
                    toast.editContent("亲，网络君开小差了");
                }
            });
        },
        methods:{
            //返回上一页
            backClick: function() {
                navigator.pop({ animated: 'true' });
            },
            //上拉刷新
            onloading (event) {
                clearTimeout(timer)//防止上拉刷新弹出删除层
                var that = this;
                const toast = this.$refs.toast
                toast.editContent("Loading...");
                that.loadinging = true;
                setTimeout(() => {
                    if (that.loadingingType) {
                        var page = that.page;
                        var type = that.type;
                        var param = this.GLOBAL.sign(this.token,this.imei);
                        param += '&page=' + page;
                        param += '&type=' + type;
                        post.fetch({
                            method: 'POST',
                            type: 'json',
                            body: param,
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            url: 'https://www.aftdc.com/businessapp/Store/getMessageDetails',
                        }, function (e) {
                            if(e.data.res === 1) {
                                var pinglunData = e.data.data;
                                that.page += e.data.page;
                                if (pinglunData.length !== 10) {
                                    that.loadingingType = 0;
                                }
                                that.pinglunData = that.pinglunData.concat(pinglunData);
                            } else if(e.data.res === 0) {
                                that.loadingingType = 0;
                            } else {
                                toast.editContent("亲，网络君开小差了哦");
                            }
                        });
                    } else {
                        toast.editContent("亲，没有更多了");
                    }
                    that.loadinging = false
                }, 1900);//2000
            },
            //长按删除
            ontouchstart(id,index){
                clearTimeout(timer)
                var that = this
                timer = setTimeout(function(){
                    that.show = true
                    that.delId = id
                    that.delIndex = index
                },1000)
            },
            //长按删除
            ontouchend(){
                clearTimeout(timer)
            },
            //防止上下滚动弹出删除层
            scrollHandler(){
                clearTimeout(timer)
            },
            //取消删除弹出层
            wxcMaskSetHidden () {
                this.show = false;
            },
            //确认删除评论消息
            commentDelect(){
                this.show = false;
                const toast = this.$refs.toast
                var param = this.GLOBAL.sign(this.token,this.imei);
                param += '&type=' + this.type;
                param += '&id=' + this.delId;
                var that = this;
                post.fetch({
                    method: 'POST',
                    type: 'json',
                    body: param,
                    headers: { "Content-Type": "application/x-www-form-urlencoded"},
                    url: 'https://www.aftdc.com/businessapp/Store/delMessage',
                }, function (e) {
                    if(e.data.res === 1) {
                        that.pinglunData.splice(that.delIndex,1)
                        toast.editContent(e.data.info);
                    } else {
                        toast.editContent(e.data.info);
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .scroller {
        padding-left: 20px;
    }
    .loading {
        width: 750px;
        display: -ms-flex;
        display: -webkit-flex;
        display: flex;
        -ms-flex-align: center;
        -webkit-align-items: center;
        -webkit-box-align: center;
        align-items: center;
        background-color: #fff;
    }
    .indicator-text {
        text-align: center;
    }
    .indicator {
        margin-top: 16px;
        height: 40px;
        width: 40px;
        color: blue;
    }

    .wrapper {
        flex-direction: column;
    }


    /***********************/

    .masking{
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-bottom-color: rgba(153, 153, 153, 0.2);
        border-bottom-style:solid ;
        border-bottom-width: 1px;
    }
    .masking:active{
        background-color: #f8f8f8;
    }
    .masks{
        flex-direction: row;
        align-items: center;
        padding-top: 20px;
        padding-bottom: 20px;
    }
    .touxiang{
        width: 120px;
        height: 120px;
        border-radius: 60px;
    }
    .userName{
        width: 380px;
        text-overflow: ellipsis;
        lines:1;
        padding-left: 20px;
    }
    .right {
        width: 590px;
        /*border-bottom-color: rgba(153, 153, 153, 0.2);*/
        /*border-bottom-style: solid;*/
        /*border-bottom-width: 1px;;*/
        margin-left: 20px;
        padding-bottom: 20px;
        padding-top: 20px;
    }

    .action{
        padding-left: 20px;
        padding-top: 10px;
        width: 380px;
        lines:1;
        text-overflow: ellipsis;
    }
    .article{
        width: 200px;
        height: 150px;
    }
    .good{
        width: 35px;
        height: 35px;
        margin-left: 20px;
        margin-top: 5px;
        margin-bottom: 5px;
    }
    /* 删除评论提示层 */
    .mask {
        flex: 1;
        position: relative;
        padding-top: 46px;
        /*padding-left: 50px;*/
    }
    .maskTitle {
        font-size: 36px;
        color: #181818;
        margin-left: 50px;
    }
    .maskContent {
        width: 440px;
        color: #898989;
        padding-top: 40px;
        font-size: 32px;
        margin-left: 50px;
    }
    .maskBtn {
        width: 566px;
        height: 90px;
        position: absolute;
        /*right: 40px;*/
        /*bottom: 38px;*/
        bottom: 0px;
        flex-direction: row;
    }
    .maskSure {
        text-align: center;
        line-height: 90px;
        flex: 1;
        color: #757575;
        /*margin-right: 56px;*/
        font-size: 32px;
        border-top-width: 1px;
        border-top-style: solid;
        border-top-color: #e7e7e7;
    }
    .maskCancel {
        text-align: center;
        line-height: 90px;
        flex: 1;
        color: #53beb7;
        font-size: 32px;
        border-top-width: 1px;
        border-top-style: solid;
        border-top-color: #e7e7e7;
        border-left-width: 1px;
        border-left-style: solid;
        border-left-color: #e7e7e7;
    }
</style>
