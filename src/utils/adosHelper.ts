import { delay } from "./delay";
import { formatName } from "./formatName";
import { waitFor, waitForElement } from "./waitForElement";

const defaultTimeoutMilliseconds = 2500;

export async function selectTeam(name: string): Promise<boolean> {
  try {
    const teamNameDropdown = (await waitForElement(document.body, ".directory-selector-dropdown", defaultTimeoutMilliseconds)) as HTMLElement;

    if (teamNameDropdown.textContent?.toLowerCase() === name.toLowerCase()) {
      return true; // correct team name is already selected
    }

    const teamNameDropdown2Button = (await waitForElement(teamNameDropdown, ".bolt-button", defaultTimeoutMilliseconds)) as HTMLElement;
    teamNameDropdown2Button.click();

    const row = await waitFor<HTMLElement>(() => {
      const rows = document.querySelectorAll(".directory-dropdown-link");
      return Array.from(rows).find(x => x.textContent?.toLowerCase() === name.toLowerCase() || x.textContent?.toLowerCase() === `team ${name.toLowerCase()}`) as HTMLElement;
    }, defaultTimeoutMilliseconds);

    row.click();
    await delay(1000);

    return true;
  } catch {
    return false;
  }
}

export async function selectPerson(name: string): Promise<boolean> {
  try {
    const personNameDropdown = await waitFor<HTMLElement>(() => {
      const results = document.evaluate("//div[starts-with(text(),'Person: ')]", document);
      return results.iterateNext() as HTMLElement | null;
    });

    personNameDropdown.click();

    const rows = await waitFor<HTMLElement[]>(() => {
      const results = Array.from(document.querySelectorAll(".bolt-list-row"));
      return results.length ? (results as HTMLElement[]) : null;
    });

    let allOption: HTMLElement | undefined;
    const personNameOptions: HTMLElement[] = [];

    for (const personNameOption of rows) {
      switch (personNameOption.textContent) {
        case "@Me":
          break;
        case "All":
          allOption = personNameOption;
          break;
        case "Unassigned":
          break;
        default:
          personNameOptions.push(personNameOption);
          break;
      }
    }

    let best: HTMLElement | undefined;
    for (const person of personNameOptions) {
      const name1 = formatName(name).toLowerCase();
      const name2 = formatName(person.textContent).toLowerCase();

      if (name2.startsWith(name1)) {
        best = person;
      }
    }

    if (best) {
      best.click();
    } else {
      allOption?.click();
    }
    return true;
  } catch {
    return false;
  }
}
