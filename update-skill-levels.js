// update-skill-levels.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting skill level migration...')
  
  // Map old skill levels to new ones
  const skillMapping = {
    'BEGINNER': 'BEGINNER_2_0',
    'INTERMEDIATE': 'INTERMEDIATE_3_25',
    'ADVANCED': 'ADVANCED_4_25',
    'PRO': 'PRO_5_5'
  }
  
  // Get all users
  const users = await prisma.user.findMany()
  console.log(`Found ${users.length} users to update`)
  
  // Count of users updated for each skill level
  const updateCounts = {}
  
  // Update each user
  for (const user of users) {
    const oldSkill = user.skill_level
    
    // Skip if the skill is already in the new format
    if (!skillMapping[oldSkill]) {
      console.log(`Skipping user ${user.name || user.id} - skill level ${oldSkill} already in new format`)
      continue
    }
    
    const newSkill = skillMapping[oldSkill]
    
    try {
      await prisma.$executeRaw`UPDATE "User" SET skill_level = ${newSkill} WHERE id = ${user.id}`
      
      // Count updates
      updateCounts[oldSkill] = (updateCounts[oldSkill] || 0) + 1
      
      console.log(`Updated user ${user.name || user.id} from ${oldSkill} to ${newSkill}`)
    } catch (error) {
      console.error(`Error updating user ${user.id}:`, error)
    }
  }
  
  console.log('Update summary:')
  for (const [oldSkill, count] of Object.entries(updateCounts)) {
    console.log(`- ${oldSkill} → ${skillMapping[oldSkill]}: ${count} users`)
  }
  
  console.log('Migration completed')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Migration failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })