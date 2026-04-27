<template>
  <MainLayout>
    <div class="profile-page container">
      <h2>Profile Settings</h2>
      <p class="subtitle">Manage your account details and preferences.</p>
      
      <div class="profile-content">
        <ProfileSection />
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '../components/MainLayout.vue'
import ProfileSection from '../components/ProfileSection.vue'
</script>

<style scoped>
.profile-page {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

h2 {
  font-size: 28px;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.profile-content {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
}

[data-theme="dark"] .subtitle {
  color: #aaa;
}
</style>
