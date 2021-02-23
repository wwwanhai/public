 const fileRes = {
  showSuccessRes (header, res) {
    document.getElementById('file_res').style.display = 'flex'
    document.getElementById('status_success').style.display = 'block'
    document.getElementById('status_title').innerText = header
    document.getElementById('status_res').innerHTML = res
  },
  showFiedRes(header, res) {
    document.getElementById('file_res').style.display = 'flex'
    document.getElementById('status_fild').style.display = 'block'
    document.getElementById('status_title').innerText = header
    document.getElementById('status_res').innerHTML = res
  }
}

export default fileRes