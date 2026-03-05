export default function editTitle(input: string): string {
    return input
      .replace(/([()])/g, " $1") // Add spaces around parentheses
      .replace(/&/g, " & ") // Add spaces around &
      .replace(/(?<!^)([A-Z])/g, " $1") // Add space before capital letters (not the first one)
      .replace(/\(\s+/g, "(") // Remove space after opening parenthesis
      .replace(/\s+\)/g, ")"); // Remove space before closing parenthesis
  }
  