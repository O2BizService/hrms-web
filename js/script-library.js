const SERVER_URL = getServerUrl();
var edit = location.search.split('=')[0].indexOf('edit') == 1;
var employeeData;
var personalInfoData;
var isEditEducationScreen;
var isEditBankDetails = false;
var isEditHistDetails;

function hideDivWhenTrue(obj, id) {
    if (obj.checked) {
        $('#' + id).hide()
    }
}

function isSameAddress(obj) {
    if (obj.checked) {
        hideDivWhenTrue(obj, "permenantAddress");
    } else {
        $('#paddress').val("")
        $('#ppincode').val("")
        $('#pstate').val("")
        $('#pcountry').val("")
        $("#permenantAddress").show();
    }
}

function addDataFormModal(id, fomrId) {
    isEditEducationScreen = false;
    isEditHistDetails = false;
    clearForm(fomrId);
    $('#' + id).modal("show");
}

function closeModal(id) {
    $('#' + id).modal('toggle');
}

function showModal(id, content) {
    $('#' + id).modal("show");
    $('#contentText').html(content);
}

$('#btnsignin').click(function () {
    localStorage.clear();
    if ($("#loginNumber").val() == "" || $("#loginPassword").val() == "" || $("#clientCode").val() == "") {
        showModal("loginModal", "Please enter Code, Mobile Number and Password",);
        return false;
    }
    localStorage.setItem("clientCode", $("#clientCode").val().toUpperCase());
    $(this).html("<i class='lds-hourglass'></i>&nbsp;&nbsp;Please Wait...").attr("disabled", true);
    var map = {};
    map["mobile"] = $("#loginNumber").val();
    map["password"] = $("#loginPassword").val();
    $.ajax({
        url: SERVER_URL + localStorage.getItem("clientCode") + '/login',
        type: 'post',
        data: JSON.stringify(map),
        complete: function (response) {
            if (response.status == 200) {
                if (typeof response.responseJSON === "string") {
                    showModal("loginModal", response.responseJSON);
                    $('#btnsignin').html("Sign in").attr("disabled", false);
                } else {
                    localStorage.setItem("token", response.responseJSON.token);
                    localStorage.setItem("userName", response.responseJSON.user.username);
                    localStorage.setItem("mobile", response.responseJSON.user.mobile);
                    localStorage.setItem("createdDate", response.responseJSON.user.createdDate);
                    location.href = "pages/dashboard.html"
                }
            } else {
                showModal("loginModal", response.responseJSON);
                $('#btnsignin').html("Sign in").attr("disabled", false);
            }
        }
    });
});

$("#addNewContainer").click(function () {
    var i = 1;
    $("#EducationForm").append($('#EducationForm').html());
    $("#EducationForm").responseJSON()
});

function base64Encode(fileId, setEncodeId, extensionId) {
    var fileInput = document.getElementById(fileId);
    if (fileInput.files[0] != undefined) {
        if (fileInput.files[0].size / 1024000 <= 2) {
            var reader = new FileReader();
            reader.readAsDataURL(fileInput.files[0]);
            reader.onload = function () {
                var imput = reader.result;
                var replaceValue = (imput.split(',')[0]);
                var base64 = imput.replace(replaceValue + ',', '');
                $('#' + setEncodeId).val(base64);
                $('#' + extensionId).val('.' + replaceValue.split('/')[1].split(';')[0]);
            }
        } else {
            showModal('addEmployeeModal', 'File size should not be bigger than 2 MB.');
            $('#' + fileId).val('');
        }
    } else {
        $('#' + fileId).val('');
        $('#' + setEncodeId).val('');
    }
}

$(document).ready(function () {
    $("input").keyup(function () {
        if ($(this).val() != "") {
            removeError($(this));
        }
    });
});

function addError(obj) {
    obj.focus();
    obj.addClass("error-text");
    $([document.documentElement, document.body]).animate({
        scrollTop: obj.offset().top - 30
    }, 2000);
    $(obj.parent().find('span').get(0)).addClass('error-text');
}

function removeError(obj) {
    obj.removeClass("error-text");
    obj.parent().parent().parent().removeClass("error-text");
    $(obj.parent().find('span').get(0)).removeClass('error-text');
}

function removeError1(obj) {
    removeError($(obj));
}

function downloadAttachment(obj, attachmentId, formName, loader) {
    $("#" + loader).css('display', 'block');
    $("#" + loader).css('visibility', 'visible')
    $("#" + $(obj).attr('id')).hide();
    var map = {};
    map["id"] = employeeData.id;
    if (formName == "personalInfo") {
        map["screen"] = formName;
        map["docType"] = attachmentId;
        map["fileName"] = $(obj).html();
    }
    if (formName == "educationalInfo") {
        map["screen"] = formName;
        map["listID"] = $("#" + attachmentId).val();
        map["fileName"] = $(obj).html();
    }
    if (formName == 'bankDetails') {
        map["screen"] = formName;
        map["fileName"] = $(obj).html();
    }
    if (formName == 'empHistory') {
        map["screen"] = formName;
        map["listID"] = $("#" + attachmentId).val();
        map["fileName"] = $(obj).html();
    }
    $.ajax({
        type: 'POST',
        headers: {
            'token': localStorage.getItem("token"),
        },
        url: SERVER_URL + localStorage.getItem("clientCode") + "/download-attachment",
        data: JSON.stringify(map),
        complete: function (response) {
            var byteArray = $.map(response.responseJSON, function (element) {
                return element;
            });
            var Arr = base64ToArrayBuffer(byteArray);
            saveByteArray($(obj).html(), Arr);
            $("#" + loader).css('display', 'none');
            $("#" + loader).css('visibility', 'hidden');
            $("#" + $(obj).attr('id')).show();
        }
    });

    return false;
}

function base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
        var ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes;
}

function saveByteArray(reportName, byte) {
    var blob = new Blob([byte], { type: "application/jpg" });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
};

function getFormData(form) {
    var unindexed_array = $(form).serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function (n, i) {
        var name = n['name'];
        var value = n['value'];
        indexed_array[name] = value;
    });
    return indexed_array;
}

function persnalInfoValidation(formName, saveBtn) {

    var form = document.forms[formName];
    var fName = form["fName"].value;
    var lName = form["lName"].value;
    var mobile = form["mobile"].value;
    var gender = form["gender"].value;
    var email = form["email"].value;
    var dob = form["dob"].value;
    var doj = form["doj"].value;
    var posApplied = form["posApplied"].value;
    var loc = form["loc"].value;
    var plant = form["plant"].value;
    var posApplied = form["posApplied"].value;
    var aadhar = form["aadhar"].value;
    var aadharAttach = form["aadharAttach"].value;
    var pan = form["pan"].value;
    var panAttach = form["panAttach"].value;
    var drivingLic = form["drivingLic"].value;
    var drivingAttach = form["drivingAttach"].value;
    var raddress = form["raddress"].value;
    var rpincode = form["rpincode"].value;
    var rstate = form["rstate"].value;
    var rcountry = form["rcountry"].value;
    var paddress = form["paddress"].value;
    var ppincode = form["ppincode"].value;
    var pstate = form["pstate"].value;
    var pcountry = form["pcountry"].value;
    var name = form["name"].value;
    var emrMobile = form["emrMobile"].value;
    var emrRelation = form["emrRelation"].value;
    var phoneNumberRegEx = /^[6-9]\d{9}$/;
    var gmailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var aadharRegex = /^\d{4}\s\d{4}\s\d{4}$/;
    var panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    var licenseRegex = /(([A-Z]{2}[0-9]{2})( )|([A-Z]{2}-[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$/;


    if (fName == "") {
        addError($("#fName"));
        return false;
    }
    if (lName == "") {
        addError($("#lName"));
        return false;
    }
    if (mobile == "") {
        addError($("#mobile"));
        return false;
    } else if (!mobile.match(phoneNumberRegEx)) {
        addError($("#mobile"));
        return false;
    }
    if (email != "" && !email.match(gmailRegEx)) {
        addError($("#email"));
        return false;
    }
    if (gender == "") {
        addError($("#gender"));
        return false;
    }
    if (dob == "") {
        addError($("#dob"));
        return false;
    }
    if (loc == "") {
        addError($("#loc"));
        return false;
    }
    if (plant == "") {
        addError($("#plant"));
        return false;
    }
    if (doj == "") {
        addError($("#doj"));
        return false;
    }
    if (posApplied == "") {
        addError($("#posApplied"));
        return false;
    }

    if (edit) {
        if (aadhar != "" && personalInfoData.aadhar != aadhar) {
            if (!aadhar.match(aadharRegex)) {
                addError($("#aadhar"));
                return false
            } else if (aadharAttach == "") {
                showModal('addEmployeeModal', 'Add new aadhar image');
                return false;
            }
        }
    } else {
        if (aadhar != "" && aadharAttach == "") {
            if (!aadhar.match(aadharRegex)) {
                addError($("#aadhar"));
                return false
            } else {
                showModal('addEmployeeModal', 'Add aadhar image');
                return false;
            }
        } else if (aadharAttach != "" && aadhar == "") {
            addError($("#aadhar"));
            return false;
        }
    }

    if (edit) {
        if (personalInfoData.panNo != pan) {
            if (!pan.match(panRegex)) {
                addError($("#pan"));
                return false
            } else if (panAttach == "") {
                showModal('addEmployeeModal', 'Add new pan card image');
                return false;
            }
        }
    } else {
        if (pan != "" && panAttach == "") {
            if (!pan.match(panRegex)) {
                addError($("#pan"));
                return false
            } else {
                showModal('addEmployeeModal', 'Add pan card image');
                return false;
            }
        } else if (panAttach != "" && pan == "") {
            addError($("#pan"));
            return false;
        }
    }

    if (edit) {
        if (personalInfoData.drivingLic != drivingLic) {
            if (!drivingLic.match(licenseRegex)) {
                addError($("#drivingLic"));
                return false
            } else if (drivingAttach == "") {
                showModal('addEmployeeModal', 'Add driver new license image');
                return false;
            }
        }
    } else {
        if (drivingLic != "" && drivingAttach == "") {
            if (!drivingLic.match(licenseRegex)) {
                addError($("#drivingLic"));
                return false
            } else {
                showModal('addEmployeeModal', 'Add driver license image');
                return false;
            }
        } else if (drivingAttach != "" && drivingLic == "") {
            addError($("#drivingLic"));
            return false;
        }
    }

    if (raddress == "") {
        addError($("#raddress"));
        return false;
    }
    if (rpincode == "") {
        addError($("#rpincode"));
        return false;
    }
    if (rstate == "") {
        addError($("#rstate"));
        return false;
    }
    if (rcountry == "") {
        addError($("#rcountry"));
        return false;
    }
    var isSameAddress = $('#sameaddress').prop('checked');
    if (!isSameAddress) {
        if (paddress == "") {
            addError($("#paddress"));
            return false;
        }
        if (ppincode == "") {
            addError($("#ppincode"));
            return false;
        }
        if (pstate == "") {
            addError($("#pstate"));
            return false;
        }
        if (pcountry == "") {
            addError($("#pcountry"));
            return false;
        }
    }
    if (name == "") {
        addError($("#name"));
        return false;
    }
    if (emrMobile == "") {
        addError($("#emrMobile"));
        return false;
    } else if (!emrMobile.match(phoneNumberRegEx)) {
        addError($("#emrMobile"));
        return false;
    }
    if (emrRelation == "") {
        addError($("#emrRelation"));
        return false;
    }
    if (posApplied == "Driver" && drivingLic == "") {
        addError($("#drivingLic"));
        return false;
    }
    addEmployee(formName, saveBtn);
}
function educationFormValidation(formName, saveBtn, clsBtn) {
    var form = document.forms[formName];
    var sclName = form["sclName"].value;
    var passingYear = form["passingYear"].value;
    var degree = form["degree"].value;
    var splSub = form["splSub"].value;
    var percentage = form["percentage"].value;
    var attachment = form["eduAttachment"].value;
    var other = form["other"].value;

    if (sclName == "") {
        addError($("#sclName"));
        return false;
    }
    if (passingYear == "") {
        addError($("#passingYear"));
        return false;
    }
    if (percentage == "") {
        addError($("#percentage"));
        return false;
    }
    if (splSub == "") {
        addError($("#splSub"));
        return false;
    }
    if (degree == "") {
        addError($("#degree"));
        return false;
    }
    if (degree == "Other" && other == "") {
        addError($("#other"));
        return false;
    }
    if (isEditEducationScreen) {
        if (employeeData.educationInfo[$("#educationalInfoListId").val() - 1].attachment != null) {
        }
    } else {
        if (degree != "Below SSC" && attachment == "") {
            showModal('addEmployeeModal', 'Add certificate file');
            return false;
        }
    }

    addEmployee(formName, saveBtn, clsBtn);
}
function otherDegreeShowTextField(id) {
    if ($("#" + id).val() == "Other") {
        $("#otherDegree").attr("hidden", false)
    } else {
        $("#otherDegree").attr("hidden", true)
    }
}
function bankingFormValidation(formName, saveBtn) {
    var form = document.forms[formName];
    var bankAccName = form["bankAccName"].value;
    var bankName = form["bankName"].value;
    var bankAccNo = form["bankAccNo"].value;
    var ifscCode = form["ifscCode"].value;
    var micrCode = form["micrCode"].value;
    var branch = form["branch"].value;
    var bankAdd = form["bankAdd"].value;

    if (bankAccName == "") {
        addError($("#bankAccName"));
        return false;
    }
    if (bankName == "") {
        addError($("#bankName"));
        return false;
    }
    if (bankAccNo == "") {
        addError($("#bankAccNo"));
        return false;
    }
    if (ifscCode == "") {
        addError($("#ifscCode"));
        return false;
    }
    if (micrCode == "") {
        addError($("#micrCode"));
        return false;
    }
    if (branch == "") {
        addError($("#branch"));
        return false;
    }
    if (bankAdd == "") {
        addError($("#bankAdd"));
        return false;
    }
    addEmployee(formName, saveBtn);
}
function historyFormValidation(formName, saveBtn, clsBtn) {
    var form = document.forms[formName];
    var positionHeld = form["positionHeld"].value;
    var hisDOJ = form["hisDOJ"].value;
    var lwd = form["lwd"].value;
    var company = form["company"].value;
    var responsibities = form["responsibities"].value;
    var costToComp = form["costToComp"].value;
    var exp = form["exp"].value;


    if (company == "") {
        addError($("#company"));
        return false;
    }
    // if (positionHeld == "") {
    //     addError($("#positionHeld"));
    //     return false;
    // }
    // if (hisDOJ == "") {
    //     addError($("#hisDOJ"));
    //     return false;
    // }
    // if (lwd == "") {
    //     addError($("#lwd"));
    //     return false;
    // }
    // if (responsibities == "") {
    //     addError($("#responsibities"));
    //     return false;
    // }
    // if (costToComp == "") {
    //     addError($("#costToComp"));
    //     return false;
    // }
    // if (exp == "") {
    //     addError($("#exp"));
    //     return false;
    // }
    addEmployee(formName, saveBtn, clsBtn);
}

function addEmployee(formName, saveBtn, clsBtn) {
    if (formName == "personalInfo") {
        var isSameAddress = $('#sameaddress').prop('checked');
        if (isSameAddress) {
            $('#paddress').val($('#raddress').val())
            $('#ppincode').val($('#rpincode').val())
            $('#pstate').val($('#rstate').val())
            $('#pcountry').val($('#rcountry').val())
        }
    }

    var map = getFormData("#" + formName);
    if (formName == "personalInfo") {
        if (edit) {
            if (personalInfoData.attachment != null || personalInfoData.attachment != "") {
                map['attachment'] = personalInfoData.attachment;
            } else if ($('#attachment').val() != null || $('#attachment').val() != "") {
                map['attachment'] = $('#fName').val() + $('#lName').val() + '.jpg';
            }
        } else if ($('#attachment').val() != null || $('#attachment').val() != "") {
            map['attachment'] = $('#fName').val() + $('#lName').val() + '.jpg';
        }

        if ($('#aadhar').val() != null || $('#aadhar').val() != "") {
            if ($('#aadharAttach').val() != null || $('#aadharAttach').val() != "") {
                map['aadharAttach'] = $('#aadhar').val() + '.jpg';
            }
        }

        if ($('#pan').val() != null || $('#pan').val() != "") {
            if ($('#panAttach').val() != null || $('#panAttach').val() != "") {
                map['panAttach'] = $('#pan').val() + ".jpg";
            }
        }

        if ($('#drivingLic').val() != null || $('#drivingLic').val() != "") {
            if ($('#drivingAttach').val() != null || $('#drivingAttach').val() != "") {
                map['drivingAttach'] = $('#drivingLic').val() + '.jpg';
            }
        }
    }
    var reqFor = "";
    map['screen'] = formName;
    if (edit) {
        reqFor = "/edit-employee-details";
        map['id'] = location.search.split('=')[1];
        if (formName == "educationalInfo") {
            map['listID'] = $('#' + formName + "ListId").val();
            if ($('#degree').val() == "Other") {
                map['degree'] = $('#other').val();
            } else {
                map['degree'] = $('#degree').val();
            }
            if (isEditEducationScreen == false) {
                reqFor = "/add-employee-details";
            }
        }
        if (formName == "empHistory") {
            map['listID'] = $('#' + formName + "ListId").val();
            if (isEditHistDetails == false) {
                reqFor = "/add-employee-details";
            }
        }
        if (formName == "bankDetails") {
            map['listID'] = $('#' + formName + "ListId").val();
            if (isEditBankDetails == false) {
                reqFor = "/add-employee-details";
            }
        }
    } else {
        reqFor = "/add-employee-details";
    }

    $("#" + saveBtn).html('<i class="fa fa-spinner fa-spin"></i>&nbsp;&nbsp;&nbsp;Please Wait ...').prop('disabled', true);
    $("#" + clsBtn).hide();

    $.ajax({
        type: 'POST',
        headers: {
            'token': localStorage.getItem("token"),
        },
        url: SERVER_URL + localStorage.getItem("clientCode") + reqFor,
        data: JSON.stringify(map),
        complete: function (response) {
            if (response.status == 200) {
                ajaxEnd(formName);
                if (formName == "personalInfo") {
                    uploadImage('attachment');
                    uploadImage('aadharAttach');
                    uploadImage('panAttach');
                    uploadImage('drivingAttach');
                    $("#permenantAddress").show();
                    if (response.responseJSON['msg'] != null) {
                        showModal('addEmployeeModal', response.responseJSON['msg']);
                    } else {
                        showModal('addEmployeeModal', response.responseJSON);
                    }
                } else {
                    $("#otherDegree").attr("hidden", true)
                    showModal('addEmployeeModal', response.responseJSON);
                }

            } else {
                showModal('addEmployeeModal', response.responseJSON);
            }
            $("#" + clsBtn).show();
            $("#" + saveBtn).html('Save').prop('disabled', false);
        }
    });
    return false;
}


function uploadImage(fileid) {
    if ($('#' + fileid).val() != null || $('#' + fileid).val() != "") {
        var map = {};
        map['id'] = employeeData.id;
        map[fileid] = $('#' + fileid).val();
        $.ajax({
            type: 'POST',
            headers: {
                'token': localStorage.getItem("token"),
            },
            url: SERVER_URL + localStorage.getItem("clientCode") + '/save-image',
            data: JSON.stringify(map),
        });
    }
}

function ajaxEnd(formName) {
    $(document).ajaxStop(function () {
        if (edit) {
            clearForm(formName);
            getEployeeDetails(location.search.split('=')[1]);
            $(document).unbind("ajaxStop");
        }
    })
};

function clearForm(formName) {
    document.getElementById(formName).reset();
    $("#" + formName + 'Download').attr('hidden', true);
    $("#" + formName + 'Image').html('');
}

function errorRequest() {
    location.href = "../index.html";
}

function emptyIfNull(value) {
    if (value == null) {
        return '';
    } else {
        return value;
    }
}

function getAllEployeeDetails() {
    $('#employeeTable').DataTable().destroy();
    $("#employeeTableBody").html('');
    var map = { 'limit': '50' }
    $.ajax({
        type: 'POST',
        headers: {
            'token': localStorage.getItem("token"),
        },
        url: SERVER_URL + localStorage.getItem("clientCode") + '/get-all-employee-details',
        data: JSON.stringify(map),
        success: function (response) {
            console.log(response);
            $(response).each(function (index, obj) {
                var str = "<tr><td>" + (++index) + "</td><td class='roleClass'>" + emptyIfNull($(obj).attr('fName')) + "</td><td>" + emptyIfNull($(obj).attr('lName')) + "</td><td>" + emptyIfNull($(obj).attr('mobile')) + "</td><td>" + emptyIfNull($(obj).attr('plant')) + "</td><td>" + emptyIfNull($(obj).attr('loc')) + "</td>";
                str += '<td>';
                str += '<button type="button" class="btn btn-primary" title="Edit" alt="Edit" data-id="' + $(obj).attr('id') + '" onClick="editEmployeeScreen(this)"><i class="fa fa-edit"></i></button>';
                str += '&nbsp;&nbsp;';
                str += '<button type="button" class="btn btn-danger" title="Remove" alt="Remove" data-id="' + $(obj).attr('id') + '" onClick="deleteEmployeeModal(this)"><i class="fa fa-trash"></i></button>';
                str += '</td></tr>';
                $("#employeeTable").append(str);
            });
            $('#employeeTable').DataTable({ "pageLength": 25 });
        },
        error: function (response) {
            showModal('employeeModal2', response.responseJSON);
        }
    });
    return false;
}

function editEmployeeScreen(obj) {
    location.href = "add-employee.html?edit.id=" + obj.dataset.id;
    getEployeeDetails(obj.dataset.id);
}

function getEployeeDetails(id) {
    var map = { 'id': id }
    $.ajax({
        type: 'POST',
        headers: {
            'token': localStorage.getItem("token"),
        },
        url: SERVER_URL + localStorage.getItem("clientCode") + '/get-employee-details',
        data: JSON.stringify(map),
        success: function (response) {
            employeeData = response;
            personalInfoData = employeeData.personalInfo;
            empPersonalInfo(response);
            if (response.educationInfo != null) {
                empEducationInfoTable(response.educationInfo);
            }
            if (response.bankDetails != null) {
                empBankInfo(response.bankDetails);
            }
            if (response.empHistory != null) {
                empHistInfoTable(response.empHistory);
            }
        },
        error: function (response) {
            showModal('addEmployeeModal', response);
        }
    });
    return false;
}
function empPersonalInfo(response) {
    if (personalInfoData.attachment != null) {
        $('#PersonalServerName').html(personalInfoData.attachment);
        $('#personalDownload').attr('hidden', false);
    }
    if (personalInfoData.aadharAttach != null) {
        $('#aadharServerName').html(personalInfoData.aadharAttach);
        $('#aadharDownload').attr('hidden', false);
    }
    if (personalInfoData.panAttach != null) {
        $('#panServerName').html(personalInfoData.panAttach);
        $('#panDownload').attr('hidden', false);
    }
    if (personalInfoData.drivingAttach != null) {
        $('#licenseServerName').html(personalInfoData.drivingAttach);
        $('#licenseDownload').attr('hidden', false);
    }
    $('#fName').val(emptyIfNull(personalInfoData.fName));
    $('#mName').val(emptyIfNull(personalInfoData.mName));
    $('#lName').val(emptyIfNull(personalInfoData.lName));
    $('#mobile').val(emptyIfNull(personalInfoData.mobile));
    $('#gender').val(emptyIfNull(personalInfoData.gender));
    $('#dob').val(emptyIfNull(personalInfoData.dob));
    $('#bloodGrp').val(emptyIfNull(personalInfoData.bloodGrp));
    $('#loc').val(emptyIfNull(response.loc));
    $('#plant').val(emptyIfNull(response.plant));
    $('#email').val(emptyIfNull(personalInfoData.email));
    $('#doj').val(emptyIfNull(personalInfoData.doj));
    $('#posApplied').val(emptyIfNull(personalInfoData.position));
    $('#maritalStatus').val(emptyIfNull(personalInfoData.maritalStatus));
    $('#aadhar').val(emptyIfNull(personalInfoData.aadhar));
    $('#pan').val(emptyIfNull(personalInfoData.panNo));
    $('#drivingLic').val(emptyIfNull(personalInfoData.drivingLic));
    $('#paddress').val(emptyIfNull(personalInfoData.address.permanent.pAddress));
    $('#ppincode').val(emptyIfNull(personalInfoData.address.permanent.pPin));
    $('#pstate').val(emptyIfNull(personalInfoData.address.permanent.pState));
    $('#pcountry').val(emptyIfNull(personalInfoData.address.permanent.pCountry));
    $('#raddress').val(emptyIfNull(personalInfoData.address.residential.rAddress));
    $('#rpincode').val(emptyIfNull(personalInfoData.address.residential.rPin));
    $('#rstate').val(emptyIfNull(personalInfoData.address.residential.rState));
    $('#rcountry').val(emptyIfNull(personalInfoData.address.residential.rCountry));
    $('#name').val(emptyIfNull(personalInfoData.emgContact.name));
    $('#emrMobile').val(emptyIfNull(personalInfoData.emgContact.mobile));
    $('#emrRelation').val(emptyIfNull(personalInfoData.emgContact.relation));
    // location.reload(true);
}

function empEducationInfoTable(data) {
    $('#educationTable').DataTable().destroy();
    $("#educationTableBody").html('');
    $(data).each(function (index, obj) {
        var str = "<tr><td>" + (++index) + "</td><td class='roleClass'>" + emptyIfNull($(obj).attr('name')) + "</td><td>" + emptyIfNull($(obj).attr('passingYear')) + "</td><td>" + emptyIfNull($(obj).attr('degree')) + "</td><td>" + emptyIfNull($(obj).attr('splSub')) + "</td><td>" + emptyIfNull($(obj).attr('percentage')) + "</td>";
        str += '<td>';
        str += '<button type="button" class="btn btn-primary" title="Edit" alt="Edit" data-id="' + $(obj).attr('listID') + '" data-name = "' + $(obj).attr('name') + '" data-passingyear = "' + $(obj).attr('passingYear') + '"  data-degree = "' + $(obj).attr('degree') + '" data-splsub = "' + $(obj).attr('splSub') + '" data-percentage = "' + $(obj).attr('percentage') + '" data-attachment = "' + $(obj).attr('attachment') + '" onClick="editEducation(this)"><i class="fa fa-edit"></i></button>';
        str += '&nbsp;&nbsp;';
        str += '<button type="button" class="btn btn-danger" title="Remove" alt="Remove" data-id="' + $(obj).attr('listID') + '" onClick="deleteEducation(this)"><i class="fa fa-trash"></i></button>';
        str += '</td></tr>';
        $("#educationTable").append(str);
    });
    $('#educationTable').DataTable({ "pageLength": 10 });
}
function editEducation(data) {
    isEditEducationScreen = true;
    if (data.dataset.attachment != null) {
        $('#educationalInfoImage').html(data.dataset.attachment);
        $('#educationalInfoDownload').attr('hidden', false);
    } else {
        $('#educationalInfoDownload').attr('hidden', true);
    }
    $('#educationalInfoListId').val(data.dataset.id);
    $('#sclName').val(data.dataset.name);
    $('#passingYear').val(data.dataset.passingyear);
    var list = ['Below SSC', 'SSC', 'HSC', 'Under Graduate'];
    $.each(list, function (index, value) {
        if (data.dataset.degree == value) {
            $('#degree').val(value);
            return false;
        } else {
            $("#otherDegree").attr("hidden", false);
            $('#degree').val('Other');
            $('#other').val(data.dataset.degree);
        }
    });
    $('#splSub').val(data.dataset.splsub);
    $('#percentage').val(data.dataset.percentage);
    $('#eductaionModal').modal("show");
}
function deleteEducation(data) {

}
function empBankInfo(data) {
    isEditBankDetails = true;
    if (data.attachment != null) {
        $('#bankImage').html(data.attachment);
        $('#bankDownload').attr('hidden', false);
    }
    $('#bankAccName').val(emptyIfNull(data.bankAccName));
    $('#bankName').val(emptyIfNull(data.bankName));
    $('#bankAccNo').val(emptyIfNull(data.bankAccNo));
    $('#ifscCode').val(emptyIfNull(data.ifscCode));
    $('#micrCode').val(emptyIfNull(data.micrCode));
    $('#branch').val(emptyIfNull(data.branch));
    $('#bankAdd').val(emptyIfNull(data.bankAdd));
}

function empHistInfoTable(data) {
    $('#empHistoryTable').DataTable().destroy();
    $("#empHistoryTableBody").html('');
    $(data).each(function (index, obj) {
        var str = "<tr><td>" + (++index) + "</td><td>" + emptyIfNull($(obj).attr('company')) + "</td><td class='roleClass'>" + emptyIfNull($(obj).attr('positionHeld')) + "</td><td>" + emptyIfNull($(obj).attr('hisDOJ')) + "</td><td>" + emptyIfNull($(obj).attr('lwd')) + "</td><td>" + emptyIfNull($(obj).attr('responsibities')) + "</td><td>" + emptyIfNull($(obj).attr('costToComp')) + "</td><td>" + emptyIfNull($(obj).attr('exp')) + "</td>";
        str += '<td>';
        str += '<button type="button" class="btn btn-primary" title="Edit" alt="Edit" data-id="' + emptyIfNull($(obj).attr('listID')) + '" data-positionheld = "' + emptyIfNull($(obj).attr('positionHeld')) + '" data-doj = "' + emptyIfNull($(obj).attr('doj')) + '"  data-lwd = "' + emptyIfNull($(obj).attr('lwd')) + '" data-company = "' + emptyIfNull($(obj).attr('company')) + '" data-responsibities = "' + emptyIfNull($(obj).attr('responsibities')) + '" data-costtocomp = "' + emptyIfNull($(obj).attr('costToComp')) + '" data-exp = "' + emptyIfNull($(obj).attr('exp')) + '"  data-attachment = "' + emptyIfNull($(obj).attr('attachment')) + '" onClick="editHistory(this)"><i class="fa fa-edit"></i></button>';
        str += '&nbsp;&nbsp;';
        str += '<button type="button" class="btn btn-danger" title="Remove" alt="Remove" data-id="' + $(obj).attr('id') + '" onClick="deleteEmployee(this)"><i class="fa fa-trash"></i></button>';
        str += '</td></tr>';
        $("#empHistoryTable").append(str);
    });
    $('#empHistoryTable').DataTable({ "pageLength": 10 });
}
function editHistory(data) {
    isEditHistDetails = true;
    if (data.dataset.attachment != "") {
        $('#empHistoryImage').html(data.dataset.attachment);
        $('#empHistoryDownload').attr('hidden', false);
    } else {
        $('#empHistoryDownload').attr('hidden', true);
    }
    $('#empHistoryListId').val(data.dataset.id);
    $('#positionHeld').val(data.dataset.positionheld);
    $('#hisDOJ').val(data.dataset.doj);
    $('#lwd').val(data.dataset.lwd);
    $('#company').val(data.dataset.company);
    $('#responsibities').val(data.dataset.responsibities);
    $('#costToComp').val(data.dataset.costtocomp);
    $('#exp').val(data.dataset.exp);
    $('#empHistoryModal').modal("show");
}
function deleteHistory(data) {

}

function deleteEmployeeModal(obj) {
    localStorage.setItem('deleteId', obj.dataset.id);
    showModal('employeeModal');
}
function deleteEmployee() {
    $("#No").hide();
    $("#Yes").html('<i class="fa fa-spinner fa-spin"></i>&nbsp;&nbsp;&nbsp;Please Wait ...').prop('disabled', true);
    var map = { 'id': localStorage.getItem('deleteId') }
    $.ajax({
        type: 'POST',
        headers: {
            'token': localStorage.getItem("token"),
        },
        url: SERVER_URL + localStorage.getItem("clientCode") + '/delete-employee-details',
        data: JSON.stringify(map),
        complete: function (response) {
            closeModal('employeeModal');
            $("#No").show();
            $("#Yes").html('Yes').prop('disabled', false);
            if (response.status == 200) {
                getAllEployeeDetails();
                showModal('employeeModal', response.responseJSON);
            } else {
                showModal('employeeModal', response.responseJSON);
            }
        }
    });
    return false;
}
