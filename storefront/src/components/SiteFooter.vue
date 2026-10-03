<template>
  <footer class="footer" :class="{ open }">
    <div class="container">
      <!-- Barre compacte, toujours visible -->
      <div class="fc-bar">
        <div class="fc-brand"><img src="/logo.png" alt="PB Boutique Hommes" /></div>
        <div class="foot-socials">
          <a href="#" class="soc" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" class="soc" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" class="soc" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
          <a href="https://wa.me/2250700000000" target="_blank" rel="noopener" class="soc" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
        <button class="fc-toggle" type="button" :aria-expanded="open" aria-controls="foot-more" @click="open = !open">
          {{ open ? "Réduire" : "Plus d’informations" }} <i class="fa-solid fa-chevron-down" :class="{ rot: open }"></i>
        </button>
      </div>

      <!-- Détails : repliés par défaut sur téléphone, toujours visibles sur ordinateur -->
      <div id="foot-more" class="fc-more" :class="{ on: open }">
        <div class="fc-inner">
          <div class="footer-grid">
            <div class="foot-col">
              <h4>Catégories</h4>
              <ul>
                <li><router-link to="/categorie/chemises">Chemises</router-link></li>
                <li><router-link to="/categorie/polos">Polos</router-link></li>
                <li><router-link to="/categorie/costumes">Costumes &amp; Blazers</router-link></li>
                <li><router-link to="/categorie/pantalons">Pantalons</router-link></li>
                <li><router-link to="/categorie/accessoires">Accessoires</router-link></li>
                <li><router-link to="/categorie/nouveautes">Nouveautés</router-link></li>
              </ul>
            </div>
            <div class="foot-col">
              <h4>Aide</h4>
              <ul>
                <li><router-link to="/compte">Mon compte</router-link></li>
                <li><a href="#">Suivi de commande</a></li>
                <li><a href="#">Comment payer</a></li>
                <li><a href="#">Zones de livraison</a></li>
                <li><a href="#">Retours</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            <div class="foot-contact">
              <h4>Contact</h4>
              <p><i class="fa-brands fa-whatsapp"></i>+225 07 00 00 00 00</p>
              <p><i class="fa-solid fa-envelope"></i>contact@pbboutique.ci</p>
              <p><i class="fa-solid fa-location-dot"></i>Abidjan, Côte d'Ivoire</p>
              <p><i class="fa-solid fa-clock"></i>Lun–Sam · 8h – 20h</p>
              <div class="foot-payments"><span>Wave</span><span>Orange Money</span><span>MTN</span><span>Moov</span><span>Visa</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© 2026 PB Boutique Hommes</span>
        <div class="foot-legal"><a href="#">Mentions légales</a><a href="#">CGV</a><a href="#">Confidentialité</a></div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";
const open = ref(false);
</script>
