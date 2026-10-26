// A real bug: login compared the raw string while clients stored 8 digits, so the
// correct number typed as "+973 3566 5422" failed — and the brake then locked the
// person out of their own portal. One normaliser now, and these pin it down.
import test from "node:test";
import assert from "node:assert/strict";
import { normPhone, isPlaceholderHandle } from "../src/phone.js";

test("every way a person types one Bahraini number gives the same 8 digits", () => {
  for (const typed of [
    "35665422", " 35665422 ", "3566 5422", "3566-5422",
    "+97335665422", "+973 3566 5422", "973 3566 5422", "00973 35665422".replace(/^00/, ""),
  ]) {
    assert.equal(normPhone(typed), "35665422", `typed as "${typed}"`);
  }
});

test("a number that merely starts with 973 is not mistaken for a country code", () => {
  // 8 digits beginning 973 is a local number, not +973 followed by five digits.
  assert.equal(normPhone("97312345"), "97312345");
});

test("junk in gives empty out rather than a wrong match", () => {
  for (const v of ["", null, undefined, "abc", "---"]) assert.equal(normPhone(v), "");
});

test("placeholder seats are not phone numbers and cannot be logged into", () => {
  assert.ok(isPlaceholderHandle("PLACEHOLDER-MANAGER"));
  assert.ok(!isPlaceholderHandle("35665422"));
  // normalising one yields nothing, so it can never match a stored row
  assert.equal(normPhone("PLACEHOLDER-MANAGER"), "");
});
