<template>
  <div class="landing-page container">
    <div class="hero card">
      <h1>Welcome to TaskBuddy <br> 🖤</h1>
      <p>Where Your Task becomes Our Priority.</p>
      <div class="actions">
        <router-link to="/login"><button class="btn">Sign In</button></router-link>
        <router-link to="/signup"><button class="btn outline">Sign Up</button></router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
}
.hero {
  text-align: center;
  padding: 60px;
}
.hero h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}
.hero p {
  font-size: 1.2rem;
  margin-bottom: 40px;
  color: #666;
}
.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}
.btn.outline {
  background-color: transparent;
  color: var(--text-color);
  border: 2px solid var(--text-color);
}
.btn.outline:hover {
  background-color: var(--text-color);
  color: var(--bg-color);
}
</style>
