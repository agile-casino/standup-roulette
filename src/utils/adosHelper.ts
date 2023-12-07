import { delay } from "./delay";
import { formatName } from "./formatName";

export async function selectTeam(name: string): Promise<boolean> {
  const teamNameDropdownResults = document.evaluate("//span[starts-with(text(),'Team ')]", document);
  const teamNameDropdown = teamNameDropdownResults.iterateNext() as HTMLElement | undefined;

  if (!teamNameDropdown) {
    console.log("Could not find team name dropdown.");
    return false;
  }

  if (teamNameDropdown.textContent == name) {
    return true;
  }

  teamNameDropdown.click();
  await delay(50);

  const teamNameOptionResults = document.evaluate(`//span[text()='${name}']`, document);
  const teamNameOption = teamNameOptionResults.iterateNext() as HTMLElement | undefined;

  if (!teamNameOption) {
    return false;
  }

  teamNameOption.click();
  return true;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function selectPerson(name: string) {
  const maxRetries = 30;
  let personNameDropdown: HTMLElement | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const personNameDropdownResults = document.evaluate("//span[starts-with(text(),'Person: ')]", document);
      personNameDropdown = personNameDropdownResults.iterateNext() as HTMLElement | undefined;
      if (personNameDropdown) {
        break;
      }
    }
    catch (e) {
      if (i == maxRetries - 1) {
        console.log(e);
      }
    }

    await delay(100);
  }

  if (!personNameDropdown) {
    console.log("Could not find person name dropdown.");
    return;
  }

  await delay(100);
  personNameDropdown.click();
  await delay(100);

  const personNameOptionResults = document.evaluate(`//span[@class='vss-PickList--selectableElementButton-text']`, document);

  let allOption: HTMLElement | undefined;
  const personNameOptions: HTMLElement[] = [];

  let personNameOption = personNameOptionResults.iterateNext() as HTMLElement | undefined;
  while (personNameOption) {
    switch (personNameOption.textContent) {
    case "@Me":
      break;
    case "Unassigned":
      break;
    case "All":
      allOption = personNameOption;
      break;
    default:
      personNameOptions.push(personNameOption);
      break;
    }
    personNameOption = personNameOptionResults.iterateNext() as HTMLElement | undefined;
  }

  let best: HTMLElement | undefined;
  for (const person of personNameOptions) {
    const name1 = formatName(name);
    const name2 = formatName(person.textContent);

    if (name2.startsWith(name1)) {
      best = person;
    }
  }

  if (best) {
    best.click();
  }
  else {
    allOption?.click();
  }
}
