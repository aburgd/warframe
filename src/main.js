import prompts from 'prompts'
import axios from 'axios'

const weaponSearch = 'https://api.warframestat.us/weapons/search'

const question = {
  type: 'text',
  name: 'weapon',
  message: 'enter weapon name to search',
  style: 'default',
  initial: ''
}

function processDamageData (weapon) {
  /* eslint-disable indent */
  let processedDamage
  Object.entries(weapon.damageTypes).forEach(
      ([type, dmgOut]) => {
        processedDamage += `
  ${type}:\t${dmgOut}`
      }
    )
  /* eslint-enable indent */
  return processedDamage
}

function processRivenData (weapon) {
  switch (weapon.disposition) {
    case 1: return 'faint'
    case 2: return 'mild'
    case 3: return 'neutral'
    case 4: return 'strong'
    case 5: return 'competent'
    default: break
  }
}

function getWeaponData () {
  prompts(question)
    .then(answer => answer.weapon)
    .then(weapon => axios.get(`${weaponSearch}/${weapon}`))
    .then(response => response.data)
    .then(data => data[0])
    .then(weapon => {
      const dmgBreakdown = processDamageData(weapon)

      const rivenDispo = processRivenData(weapon)

      // Disable the indent rule for the string templating.
      // Gods it's ugly.
      /* eslint-disable indent */
      const output = `
name:\t\t${weapon.name}
slot:\t\t${weapon.category}
trigger:\t${weapon.trigger}
critChance:\t${Math.ceil(weapon.criticalChance * 100)}%
critMult:\t${weapon.criticalMultiplier}
status:\t\t${Math.ceil(weapon.procChance * 100)}%
disposition:\t${rivenDispo}
damage:
  ${dmgBreakdown}
      `
      /* eslint-enable indent */

      console.log(output.toLowerCase())
    })
    .catch(error => console.error(error))
}

getWeaponData()
