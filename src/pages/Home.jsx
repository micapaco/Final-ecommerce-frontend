import React from 'react';
import Hero from '../components/layout/Hero';
import FeaturedProducts from '../components/products/FeaturedProducts';
import FeaturedBrands from '../components/products/FeaturedBrands';

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <FeaturedBrands />
    </>
  );
};

export default Home;
