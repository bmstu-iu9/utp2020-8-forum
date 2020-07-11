'use strict'

const exceptionHandle = (form) => {
    const pwd = form.psw.value;
    const repwd = form.pswConf.value;
    if (pwd != repwd) {
        alert('verify password seem incorrect');
        return false;
    }

}
