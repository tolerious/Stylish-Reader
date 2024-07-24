export function logger(message: string): void {
  console.log(
    `%c${message}`,
    `padding: 2px 3px;color: white;background-color:#42b983; font-size: 16px;`
  );
}
