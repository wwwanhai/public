const board = {
  showBoard (e) {
    const boardList = document.getElementsByClassName('hg-button ')
    for(let i = 0; i < boardList.length; i++ ) {
      if (boardList[i].attributes['data-skbtn'].nodeValue == e) {
        if (boardList[i].className.indexOf('lineBoard') == -1) {
          boardList[i].classList.add('lineBoard')
        }
      } else {
        if (boardList[i].className.indexOf('lineBoard') != -1) {
          boardList[i].classList.remove('lineBoard')
        }
      }
    }
  },

  // 添加小文字
  showSmallBorad (e, val) {
    if (e.lastChild.className == 'small_board') {
    } else {
      var node = document.createElement("span")
      node.className = 'small_board'
      node.innerText = val
      e.appendChild(node)
    }

  },

  // 隐藏小文字
  hideSmallBoaed () {
    const boardList = document.getElementsByClassName('hg-button ')
    for(let i = 0; i < boardList.length; i++ ) {
      if (boardList[i].attributes['data-skbtn'].nodeValue == e) {
        console.log(boardList[i].lastChild.className)
      }
    }
  },

  //清除高亮状态
  clearLine () {
    const boardList = document.getElementsByClassName('hg-button')
    for(let i = 0; i < boardList.length; i++ ) {
      if (boardList[i].className.indexOf('lineBoard') != -1) {
        boardList[i].classList.remove('lineBoard')
      }
    }
  }
}
export default board;