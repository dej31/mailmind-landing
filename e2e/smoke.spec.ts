import { test, expect } from '@playwright/test'

/** Smoke tests qui ne nécessitent pas de vrai projet Supabase — ils
 * vérifient que la coquille de l'application se charge et navigue
 * correctement. Pour le parcours complet (créer un tournoi, saisir des
 * scores, publier...), voir e2e/full-tournament.spec.ts qui a besoin de
 * variables d'environnement pointant vers un projet Supabase de test. */

test('home page shows the organizer entry point', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Halle Back')).toBeVisible()
  await expect(page.getByRole('link', { name: /espace organisateur/i })).toBeVisible()
})

test('unauthenticated admin access redirects to login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByLabel('Email')).toBeVisible()
})

test('an unknown public tournament shows a friendly not-found message', async ({ page }) => {
  await page.goto('/tournoi/ce-tournoi-nexiste-pas')
  await expect(page.getByText('Tournoi introuvable')).toBeVisible({ timeout: 15_000 })
})
