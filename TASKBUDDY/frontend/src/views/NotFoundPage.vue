<template>
  <div class="not-found container">
    <div class="card error-card">
      <h2>404 - Page Not Found</h2>
      <p>The routing path you entered does not match any valid page.</p>
      <router-link to="/"><button class="btn">Go Home</button></router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
}
.error-card {
  text-align: center;
  padding: 40px;
}
.error-card h2 {
  color: var(--error-color);
  margin-bottom: 15px;
}
</style>
