const tweets = Array.from(document.querySelectorAll('.tweet'))

tweets.forEach((tweet) => {
  const mainLink = tweet.querySelector('.main-link')
  const clickableElements = Array.from(tweet.querySelectorAll('.clickable'))

  clickableElements.forEach((ele) =>
    ele.addEventListener('click', (e) => e.stopPropagation())
  )

  function handleClick (event) {
    const noTextSelected = !window.getSelection().toString()

    if (noTextSelected) {
      mainLink.click()
    }
  }

  tweet.addEventListener('click', handleClick)
})
