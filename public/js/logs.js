const $logholder = document.querySelector("#LOG_HOLDER")
const $logTemplate = `
<div class="row">
<div class="card col-12">
<div class="card-wrapper">
        <div class="col">
            <h4 class="card-title mbr-fonts-style display-5"><strong>{{sender}}</strong> - {{cmd}}</h4>
    </div>
</div>
</div>
</div>
`
fetch('/logs').then((response) => {
    response.json().then((data) => {
        var html = ""
        for (var a = data.length - 1; a >= 0; a--) {
            if (data[a].auctionID != 0) {
                html += Mustache.render($logTemplate, {
                    sender: data[a].sender,
                    cmd: data[a].command
                })
            }
        }
        $logholder.innerHTML += html
    }).catch(function (err) {
        console.log(err)
    })
})