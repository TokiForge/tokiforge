<template>
  <Head>
    <template v-if="frontmatter.title">
      <title>{{ frontmatter.title }} | TokiForge</title>
      <meta property="og:title" :content="`${frontmatter.title} | TokiForge`" />
      <meta name="twitter:title" :content="`${frontmatter.title} | TokiForge`" />
    </template>
    <template v-if="frontmatter.description">
      <meta name="description" :content="frontmatter.description" />
      <meta property="og:description" :content="frontmatter.description" />
      <meta name="twitter:description" :content="frontmatter.description" />
    </template>
    <link rel="canonical" :href="`https://tokiforge.dev/tokiforge${$route.path}`" />
  </Head>
</template>

<script setup lang="ts">
import { useData, Head } from 'vitepress';

const { frontmatter } = useData();
</script>

