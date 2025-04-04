// about-us.component.ts
import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css'],
})
export class AboutUsComponent implements OnInit {
  imageLoaded = false;
  imageError = false;

  keyFeatures = [
    {
      icon: 'fas fa-hands',
      title: 'Artisan Crafted',
      description:
        'Each piece meticulously handmade by skilled craftspeople using time-honored techniques',
    },
    {
      icon: 'fas fa-leaf',
      title: 'Sustainable Practices',
      description:
        'Ethical sourcing and eco-friendly production methods that respect our planet',
    },
  ];

  coreValues = [
    {
      icon: 'fas fa-heart',
      title: 'Passion',
      description: 'Infusing love into every creation',
    },
    {
      icon: 'fas fa-lightbulb',
      title: 'Innovation',
      description: 'Modern designs rooted in tradition',
    },
    {
      icon: 'fas fa-users',
      title: 'Community',
      description: 'Supporting artisan communities worldwide',
    },
    {
      icon: 'fas fa-palette',
      title: 'Creativity',
      description: 'Boundary-pushing designs',
    },
    {
      icon: 'fas fa-star',
      title: 'Quality',
      description: 'Uncompromising craftsmanship',
    },
    {
      icon: 'fas fa-hand-holding',
      title: 'Ethics',
      description: 'Fair trade principles',
    },
  ];

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit(): void {
    this.setMetaTags();
  }

  private setMetaTags(): void {
    this.title.setTitle(
      'About Herafy - Artisan Handmade Crafts & Sustainable Design'
    );
    this.meta.updateTag({
      name: 'description',
      content:
        "Discover Herafy's commitment to traditional craftsmanship and sustainable practices. Learn about our artisanal processes and ethical values.",
    });
    this.meta.updateTag({
      property: 'og:image',
      content: 'https://yourdomain.com/images/about-social.jpg',
    });
    this.meta.updateTag({
      name: 'keywords',
      content:
        'handmade, sustainable, artisan crafts, ethical production, traditional techniques',
    });
  }
}
