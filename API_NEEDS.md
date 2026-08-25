# API_NEEDS.md

## Upstream and Downstream Partners

* **Upstream Partner (We Consume From):** Team 4 (Music & Event Discovery Platform)[span_0](start_span)[span_0](end_span)
* **Downstream Partner (We Provide To):** Team 6 (MoneyMentor Kenya)[span_1](start_span)[span_1](end_span)[span_2](start_span)[span_2](end_span)

---

## Downstream API Needs (APIs Team 5 Provides to Team 6)

1. **Team 6** needs to **read** **claimed item reward amounts** from **Team 5** in order to **auto-populate extra income into user savings goals and budget calculators**[span_3](start_span)[span_3](end_span)[span_4](start_span)[span_4](end_span).
   * *Freshness:* Updated within 24 hours (low urgency)[span_5](start_span)[span_5](end_span).
   * *Volume:* Called once per dashboard load[span_6](start_span)[span_6](end_span).
   * *Auth:* Public data, no authentication required[span_7](start_span)[span_7](end_span).

2. **Team 6** needs to **read** **user claim statuses** from **Team 5** in order to **track financial recovery progress on lost personal property**[span_8](start_span)[span_8](end_span)[span_9](start_span)[span_9](end_span).
   * *Freshness:* Near real-time[span_10](start_span)[span_10](end_span).
   * *Volume:* Called per profile page load[span_11](start_span)[span_11](end_span).
   * *Auth:* Requires user authentication[span_12](start_span)[span_12](end_span).

3. **Team 6** needs to **read** **school portal lost item statistics** from **Team 5** in order to **display campus financial impact data to students**[span_13](start_span)[span_13](end_span)[span_14](start_span)[span_14](end_span).
   * *Freshness:* Updated daily[span_15](start_span)[span_15](end_span).
   * *Volume:* Called once per landing page load[span_16](start_span)[span_16](end_span).
   * *Auth:* Public data, no authentication required[span_17](start_span)[span_17](end_span).

---

## Upstream API Needs (APIs Team 5 Consumes from Team 4)

1. **Team 5** needs to **read** **upcoming venue and event listings** from **Team 4** in order to **allow users to tag specific event locations when reporting lost items**[span_18](start_span)[span_18](end_span)[span_19](start_span)[span_19](end_span).
   * *Freshness:* Updated within the hour[span_20](start_span)[span_20](end_span).
   * *Volume:* Called per item report form load[span_21](start_span)[span_21](end_span).
   * *Auth:* Public data, no authentication required[span_22](start_span)[span_22](end_span).

2. **Team 5** needs to **read** **venue contact information** from **Team 4** in order to **help students reach out directly to venue managers about missing belongings**[span_23](start_span)[span_23](end_span)[span_24](start_span)[span_24](end_span).
   * *Freshness:* Static / low freshness need[span_25](start_span)[span_25](end_span).
   * *Volume:* Called on-demand when a user views item details[span_26](start_span)[span_26](end_span).
   * *Auth:* Public data, no authentication required[span_27](start_span)[span_27](end_span).

3. **Team 5** needs to **read** **artist performance schedules** from **Team 4** in order to **filter reported lost items by event date and time**[span_28](start_span)[span_28](end_span)[span_29](start_span)[span_29](end_span).
   * *Freshness:* Real-time / live schedule updates[span_30](start_span)[span_30](end_span).
   * *Volume:* Called per search query[span_31](start_span)[span_31](end_span).
   * *Auth:* Public data, no authentication required[span_32](start_span)[span_32](end_span).

---

## Audit Gap Analysis

During our requirement discussions with Team 6:
* **Supported by Audit:** Team 6 requested access to claim statuses and item reward values[span_33](start_span)[span_33](end_span). Our Part B Audit confirms that we store *Found item details* and *Ownership claims*, so this requirement is natively supported[span_34](start_span)[span_34](end_span).
* **Identified Gap:** Team 6 inquired about executing direct monetary reward payouts through our API[span_35](start_span)[span_35](end_span). Our Part B Audit confirms our application does not process digital transactions, payments, or wallet transfers[span_36](start_span)[span_36](end_span). We flagged this as a gap[span_37](start_span)[span_37](end_span); Team 6 can only read reward values as static numeric data[span_38](start_span)[span_38](end_span).

---

## Reflection

Conducting these partner interviews highlighted how interconnected distinct domain applications can be when structured in an API chain[span_39](start_span)[span_39](end_span). We initially assumed Team 6 (a financial literacy platform) would have minimal use for a lost and found system[span_40](start_span)[span_40](end_span)[span_41](start_span)[span_41](end_span). However, discovering that lost item rewards and asset losses impact budget calculations showed us the importance of understanding downstream requirements directly rather than relying on assumptions[span_42](start_span)[span_42](end_span)[span_43](start_span)[span_43](end_span). Additionally, coordinating with Team 4 showed how leveraging their venue/event data significantly enhances our item-reporting accuracy without requiring us to rebuild event-management features ourselves[span_44](start_span)[span_44](end_span)[span_45](start_span)[span_45](end_span)[span_46](start_span)[span_46](end_span).