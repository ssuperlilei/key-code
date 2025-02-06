class MySleep {
  constructor() {
    this.wait = Promise.resolve();
  }
  log(str) {
    this.wait = this.wait.then(() => {
      console.log(str);
    });
    console.log(str, this);
    return this;
  }
  sleep(ms) {
    this.wait = this.wait.then(() => new Promise(resolve => setTimeout(resolve, ms)));
    return this;
  }
}

const sleep = new MySleep();
sleep.log('1').sleep(1000).log('2').sleep(1000).log('3');
