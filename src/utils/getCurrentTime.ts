function formatTimeComponent(component: number): string {
  return component < 10 ? `0${component}` : `${component}`;
}

function getCurrentTime(): string {
  const currentDate = new Date();
  const currentHour = formatTimeComponent(currentDate.getHours());
  const currentMinute = formatTimeComponent(currentDate.getMinutes());
  const currentSecond = formatTimeComponent(currentDate.getSeconds());

  const currentTime = `${currentHour}:${currentMinute}:${currentSecond}`;
  return currentTime;
}

export default getCurrentTime;
