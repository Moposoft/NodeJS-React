const url  = "http://localhost:3000/api";

//Load random Bacon-ipsum :)
function loadIpsum() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("info").innerHTML = xhr.responseText;
        }
    };
    xhr.open("GET", "https://baconipsum.com/api/?type=meat-and-filler&paras=5&format=text", true);
    xhr.send();
}

// Delete a user uses csrf token and sends it via the header
function deleteUser(id) {
    var csrftoken = document.getElementById('_csrf').value;
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url +'/admin/users/'+ id, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('CSRF-Token', csrftoken);
    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            var item = document.getElementById(id);
            item.parentNode.removeChild(item);
            console.log(users);
        } else {
            console.log(users);
        }
    };
    xhr.onerror = function() {
        return alert(`Network Error`);
    };
    xhr.send(null);
}

function promoteToAdmin(id){
    var csrftoken = document.getElementById('_csrf').value;
    var xhr  = new XMLHttpRequest();
    xhr.open('PUT', url+"/admin/users/"+id+"/role", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('CSRF-Token', csrftoken);
    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            window.location.reload();
            console.log(users);
        } else {
            console.log(users);
        }
    };
    xhr.onerror = function() {
        return alert(`Network Error`);
    };
    xhr.send('role=2');
}

function demoteToUser(id){
    var csrftoken = document.getElementById('_csrf').value;
    var xhr  = new XMLHttpRequest();
    xhr.open('PUT', url+"/admin/users/"+id+"/role", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('CSRF-Token', csrftoken);
    xhr.onload = function () {
        var users = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            window.location.reload();
            console.log(users);
        } else {
            console.log(users);
        }
    };
    xhr.onerror = function() {
        return alert(`Network Error`);
    };
    xhr.send('role=1' );
}