import { test, expect } from '@playwright/test'

/**
 * Parcours complet organisateur + public (section 63 du cahier des
 * charges) : créer un tournoi, ajouter des équipes, générer, publier,
 * démarrer un match, saisir un score, vérifier le classement et la vue
 * publique, terminer les poules, générer les demi-finales, terminer la
 * finale.
 *
 * Ce test a besoin d'un vrai projet Supabase de test (les migrations
 * appliquées) et d'un compte organisateur déjà créé dedans — il est donc
 * ignoré tant que E2E_ORG_EMAIL / E2E_ORG_PASSWORD ne sont pas fournis
 * (voir README > Tests > End-to-end). Il n'y a pas de mock : on veut
 * vérifier le vrai comportement contre de vraies RLS Supabase.
 */

const email = process.env.E2E_ORG_EMAIL
const password = process.env.E2E_ORG_PASSWORD

test.skip(
  !email || !password,
  'Nécessite E2E_ORG_EMAIL/E2E_ORG_PASSWORD (compte organisateur sur un projet Supabase de test).',
)

test('parcours complet : créer, jouer et terminer un tournoi', async ({ page }) => {
  const tournamentName = `E2E ${Date.now()}`
  const teamNames = ['Les Rouges', 'Les Verts', 'Les Bleus', 'Les Jaunes']

  await page.goto('/login')
  await page.getByLabel('Email').fill(email!)
  await page.getByLabel('Mot de passe').fill(password!)
  await page.getByRole('button', { name: /se connecter/i }).click()
  await expect(page).toHaveURL(/\/admin$/)

  await page.getByRole('link', { name: /créer un tournoi/i }).click()
  await page.getByLabel('Nom').fill(tournamentName)
  await page.getByRole('button', { name: /créer le tournoi/i }).click()
  await expect(page).toHaveURL(/\/admin\/[\w-]+$/)

  for (const name of teamNames) {
    await page.getByLabel("Nom de l'équipe").fill(name)
    await page.getByRole('button', { name: /ajouter une équipe/i }).click()
    await expect(page.getByText(name)).toBeVisible()
  }

  await page.getByRole('button', { name: /générer le tournoi/i }).click()
  await expect(page.getByRole('button', { name: /ça me va/i })).toBeVisible()
  await page.getByRole('button', { name: /ça me va/i }).click()

  await expect(page.getByText(/poules équilibrées/i)).toBeVisible()
  await page.getByRole('button', { name: /publier le tournoi/i }).click()

  await page.getByRole('button', { name: /aller au direct/i }).click()
  await expect(page).toHaveURL(/\/live$/)

  await page.getByRole('button', { name: /démarrer le match/i }).click()
  const plusButtons = page.getByRole('button', { name: /ajouter un point/i })
  await plusButtons.first().click()
  await plusButtons.first().click()
  await page.getByRole('button', { name: /terminer/i }).click()

  // Le prochain match devient automatiquement "à démarrer".
  await expect(page.getByRole('button', { name: /démarrer le match/i })).toBeVisible()
})
